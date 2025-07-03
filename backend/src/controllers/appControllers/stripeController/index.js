const mongoose = require('mongoose');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Invoice = mongoose.model('Invoice');
const Payment = mongoose.model('Payment');
const Client = mongoose.model('Client');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invoice ID and amount are required',
      });
    }

    // Verify the invoice exists
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      removed: false,
    }).populate('client');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: invoice.currency || 'usd',
      metadata: {
        invoiceId: invoiceId,
        clientId: invoice.client._id.toString(),
      },
      description: `Payment for Invoice #${invoice.number}/${invoice.year}`,
    });

    return res.status(200).json({
      success: true,
      result: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      message: 'Payment intent created successfully',
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`,
    });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // Extract metadata
      const { invoiceId, clientId } = paymentIntent.metadata;
      
      // Create a payment record
      const payment = new Payment({
        invoice: invoiceId,
        client: clientId,
        amount: paymentIntent.amount / 100, // Convert back from cents
        paymentMode: 'stripe',
        ref: paymentIntent.id,
        description: 'Payment processed via Stripe',
        date: new Date(),
        createdBy: req.admin ? req.admin._id : null,
      });
      
      await payment.save();
      
      // Update invoice payment status
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        const newCredit = invoice.credit + (paymentIntent.amount / 100);
        const paymentStatus = 
          newCredit >= invoice.total ? 'paid' : 
          newCredit > 0 ? 'partially' : 'unpaid';
        
        await Invoice.findByIdAndUpdate(invoiceId, {
          $push: { payment: payment._id },
          $set: { paymentStatus },
          $inc: { credit: paymentIntent.amount / 100 },
        });
      }
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing payment success:', error);
      return res.status(500).json({
        success: false,
        message: `Error processing payment: ${error.message}`,
      });
    }
  }
  
  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Verify the client exists
    const client = await Client.findOne({
      _id: clientId,
      removed: false,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Client not found',
      });
    }
    
    // In a real implementation, you would fetch the customer's saved payment methods
    // For this demo, we'll return a mock response
    return res.status(200).json({
      success: true,
      result: [
        {
          id: 'pm_mock_visa',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        },
        {
          id: 'pm_mock_mastercard',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '5555',
            exp_month: 10,
            exp_year: 2024,
          },
        },
      ],
      message: 'Payment methods retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
    });
  }
};