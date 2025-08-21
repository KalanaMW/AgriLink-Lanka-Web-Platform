const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Only required for export orders
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    }
  }],
  orderDetails: {
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'LKR']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative']
    },
    finalAmount: {
      type: Number,
      required: true,
      min: [0, 'Final amount cannot be negative']
    }
  },
  orderType: {
    type: String,
    enum: ['domestic', 'export'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'bank-transfer', 'cash-on-delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  // Export-specific fields
  exportDetails: {
    exportLicense: String,
    destinationCountry: String,
    portOfEntry: String,
    incoterms: {
      type: String,
      enum: ['FOB', 'CIF', 'EXW', 'DDP', 'DAP']
    },
    customsDeclaration: String,
    phytosanitaryCertificate: String,
    commercialInvoice: String,
    packingList: String,
    billOfLading: String
  },
  // Shipping and logistics
  shipping: {
    method: {
      type: String,
      enum: ['air-freight', 'sea-freight', 'land-transport', 'express'],
      required: true
    },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  // Communication and updates
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  // Timestamps for different stages
  timeline: {
    orderPlaced: {
      type: Date,
      default: Date.now
    },
    orderConfirmed: Date,
    processingStarted: Date,
    shipped: Date,
    delivered: Date,
    cancelled: Date
  },
  // Additional fields
  notes: String,
  cancellationReason: String,
  refundReason: String,
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ farmer: 1 });
orderSchema.index({ exporter: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequence = (orderCount + 1).toString().padStart(4, '0');
    this.orderNumber = `AL${year}${month}${day}${sequence}`;
  }
  next();
});

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return {
    orderNumber: this.orderNumber,
    totalItems: this.products.length,
    totalAmount: this.orderDetails.finalAmount,
    status: this.status,
    orderType: this.orderType
  };
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  
  // Update timeline
  switch (newStatus) {
    case 'confirmed':
      this.timeline.orderConfirmed = new Date();
      break;
    case 'processing':
      this.timeline.processingStarted = new Date();
      break;
    case 'shipped':
      this.timeline.shipped = new Date();
      break;
    case 'delivered':
      this.timeline.delivered = new Date();
      break;
    case 'cancelled':
      this.timeline.cancelled = new Date();
      break;
  }
  
  // Add communication entry
  this.communication.push({
    sender: userId,
    message: `Order status updated to: ${newStatus}`,
    isInternal: true
  });
  
  return this.save();
};

// Method to add communication
orderSchema.methods.addCommunication = function(senderId, message, isInternal = false) {
  this.communication.push({
    sender: senderId,
    message,
    isInternal
  });
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(userId, role) {
  const matchStage = {};
  
  if (role === 'farmer') {
    matchStage.farmer = userId;
  } else if (role === 'buyer') {
    matchStage.buyer = userId;
  } else if (role === 'exporter') {
    matchStage.exporter = userId;
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$orderDetails.finalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
