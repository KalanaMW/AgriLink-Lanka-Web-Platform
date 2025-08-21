const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'leafy-greens',
      'root-vegetables',
      'fruits',
      'herbs',
      'exotic-vegetables',
      'organic-vegetables',
      'other'
    ]
  },
  variety: {
    type: String,
    required: [true, 'Product variety is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['kg', 'tons', 'pieces', 'bundles', 'crates']
    },
    minimumOrder: {
      type: Number,
      required: [true, 'Minimum order quantity is required'],
      min: [1, 'Minimum order must be at least 1']
    }
  },
  quality: {
    grade: {
      type: String,
      required: [true, 'Quality grade is required'],
      enum: ['A', 'B', 'C', 'Premium', 'Export-Quality']
    },
    certification: [{
      type: String,
      enum: ['Organic', 'GAP', 'GlobalGAP', 'HACCP', 'ISO22000', 'FairTrade']
    }],
    inspectionReport: String
  },
  pricing: {
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'LKR']
    },
    bulkDiscount: {
      type: Number,
      min: [0, 'Bulk discount cannot be negative'],
      max: [100, 'Bulk discount cannot exceed 100%']
    },
    bulkDiscountThreshold: {
      type: Number,
      min: [1, 'Bulk discount threshold must be at least 1']
    }
  },
  harvest: {
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    storageConditions: {
      type: String,
      required: [true, 'Storage conditions are required']
    }
  },
  location: {
    farmLocation: {
      type: String,
      required: [true, 'Farm location is required']
    },
    district: {
      type: String,
      required: [true, 'District is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  exportDetails: {
    isExportReady: {
      type: Boolean,
      default: false
    },
    exportCountries: [String],
    exportRestrictions: [String],
    packagingType: {
      type: String,
      enum: ['Bulk', 'Retail', 'Export-Standard', 'Custom']
    },
    packagingWeight: Number,
    palletSize: String
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'expired', 'removed'],
    default: 'available'
  },
  // Analytics and tracking
  views: {
    type: Number,
    default: 0
  },
  inquiries: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    quantity: Number,
    inquiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ farmer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'location.district': 1 });
productSchema.index({ isExportReady: 1 });
productSchema.index({ isVerified: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for days until expiry
productSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.harvest.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.harvest.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for price with bulk discount
productSchema.virtual('discountedPrice').get(function() {
  if (this.pricing.bulkDiscount && this.pricing.bulkDiscount > 0) {
    return this.pricing.pricePerUnit * (1 - this.pricing.bulkDiscount / 100);
  }
  return this.pricing.pricePerUnit;
});

// Method to check if product is available for export
productSchema.methods.isAvailableForExport = function() {
  return this.status === 'available' && 
         this.isExportReady && 
         this.isVerified && 
         this.quantity.available > 0 &&
         new Date() < this.harvest.expiryDate;
};

// Method to update quantity after order
productSchema.methods.updateQuantity = function(orderedQuantity) {
  if (this.quantity.available >= orderedQuantity) {
    this.quantity.available -= orderedQuantity;
    if (this.quantity.available === 0) {
      this.status = 'sold';
    }
    return true;
  }
  return false;
};

module.exports = mongoose.model('Product', productSchema);
