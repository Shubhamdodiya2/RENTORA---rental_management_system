const sequelize = require('../config/database');

// Import all models
const User = require('./user.model');
const Role = require('./role.model');
const UserRole = require('./userRole.model');
const CustomerProfile = require('./customerProfile.model');
const VendorProfile = require('./vendorProfile.model');
const VendorDocument = require('./vendorDocument.model');
const Category = require('./category.model');
const Product = require('./product.model');
const ProductImage = require('./productImage.model');
const ProductSpecification = require('./productSpecification.model');
const Inventory = require('./inventory.model');
const InventoryTransaction = require('./inventoryTransaction.model');
const Booking = require('./booking.model');
const BookingItem = require('./bookingItem.model');
const BookingStatusHistory = require('./bookingStatusHistory.model');
const Order = require('./order.model');
const RentalPayment = require('./rentalPayment.model');
const EscrowDeposit = require('./escrowDeposit.model');
const Commission = require('./commission.model');
const Invoice = require('./invoice.model');
const RentalAgreement = require('./rentalAgreement.model');
const Quotation = require('./quotation.model');
const QuotationItem = require('./quotationItem.model');
const Pickup = require('./pickup.model');
const Return = require('./return.model');
const QualityInspection = require('./qualityInspection.model');
const DamageReport = require('./damageReport.model');
const Complaint = require('./complaint.model');
const ComplaintMessage = require('./complaintMessage.model');
const Notification = require('./notification.model');
const PlatformSetting = require('./platformSetting.model');
const AuditLog = require('./auditLog.model');
const RefreshToken = require('./refreshToken.model');
const PasswordResetToken = require('./passwordResetToken.model');
const PaymentSubmission = require('./paymentSubmission.model');
const Review = require('./review.model');

// ==========================================
// 1. IDENTITY, ROLES & AUTH TOKENS ASSOCIATIONS
// ==========================================
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', as: 'users' });
User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' });
UserRole.belongsTo(User, { foreignKey: 'userId' });
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

User.hasOne(CustomerProfile, { foreignKey: 'userId', as: 'customerProfile', onDelete: 'CASCADE' });
CustomerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(VendorProfile, { foreignKey: 'userId', as: 'vendorProfile', onDelete: 'CASCADE' });
VendorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
VendorProfile.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

VendorProfile.hasMany(VendorDocument, { foreignKey: 'vendorId', as: 'documents', onDelete: 'CASCADE' });
VendorDocument.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });
VendorDocument.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens', onDelete: 'CASCADE' });
PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==========================================
// 2. CATALOG & INVENTORY ASSOCIATIONS
// ==========================================
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parentCategory' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

VendorProfile.hasMany(Product, { foreignKey: 'vendorId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(ProductSpecification, { foreignKey: 'productId', as: 'specifications', onDelete: 'CASCADE' });
ProductSpecification.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasOne(Inventory, { foreignKey: 'productId', as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(InventoryTransaction, { foreignKey: 'productId', as: 'inventoryTransactions', onDelete: 'CASCADE' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InventoryTransaction.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// ==========================================
// 3. BOOKINGS & ITEMS ASSOCIATIONS
// ==========================================
User.hasMany(Booking, { foreignKey: 'customerId', as: 'customerBookings' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

VendorProfile.hasMany(Booking, { foreignKey: 'vendorId', as: 'vendorBookings' });
Booking.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Booking.hasMany(BookingItem, { foreignKey: 'bookingId', as: 'items', onDelete: 'CASCADE' });
BookingItem.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Product.hasMany(BookingItem, { foreignKey: 'productId', as: 'bookingItems' });
BookingItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Booking.hasMany(BookingStatusHistory, { foreignKey: 'bookingId', as: 'statusHistory', onDelete: 'CASCADE' });
BookingStatusHistory.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
BookingStatusHistory.belongsTo(User, { foreignKey: 'performedBy', as: 'actor' });

// ==========================================
// 4. FINANCIALS & ORDERS ASSOCIATIONS
// ==========================================
Booking.hasOne(Order, { foreignKey: 'bookingId', as: 'order', onDelete: 'CASCADE' });
Order.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Order, { foreignKey: 'customerId', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

VendorProfile.hasMany(Order, { foreignKey: 'vendorId', as: 'vendorOrders' });
Order.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Order.hasMany(RentalPayment, { foreignKey: 'orderId', as: 'payments', onDelete: 'CASCADE' });
RentalPayment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
RentalPayment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
RentalPayment.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
RentalPayment.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Order.hasOne(EscrowDeposit, { foreignKey: 'orderId', as: 'escrow', onDelete: 'CASCADE' });
EscrowDeposit.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
EscrowDeposit.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
EscrowDeposit.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
EscrowDeposit.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Order.hasOne(Commission, { foreignKey: 'orderId', as: 'commission', onDelete: 'CASCADE' });
Commission.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Commission.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Order.hasOne(Invoice, { foreignKey: 'orderId', as: 'invoice', onDelete: 'CASCADE' });
Invoice.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Booking.hasOne(Invoice, { foreignKey: 'bookingId', as: 'invoice', onDelete: 'CASCADE' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Invoice.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });
Invoice.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Invoice.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });
Invoice.belongsTo(User, { foreignKey: 'verifiedByAdminId', as: 'verifier' });
User.hasMany(Invoice, { foreignKey: 'customerId', as: 'customerInvoices' });
VendorProfile.hasMany(Invoice, { foreignKey: 'vendorId', as: 'vendorInvoices' });

Order.hasMany(PaymentSubmission, { foreignKey: 'orderId', as: 'paymentSubmissions', onDelete: 'CASCADE' });
PaymentSubmission.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Booking.hasMany(PaymentSubmission, { foreignKey: 'bookingId', as: 'paymentSubmissions', onDelete: 'CASCADE' });
PaymentSubmission.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
User.hasMany(PaymentSubmission, { foreignKey: 'customerId', as: 'customerPaymentSubmissions' });
PaymentSubmission.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
VendorProfile.hasMany(PaymentSubmission, { foreignKey: 'vendorId', as: 'vendorPaymentSubmissions' });
PaymentSubmission.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });
PaymentSubmission.belongsTo(User, { foreignKey: 'verifiedByAdminId', as: 'verifier' });

Order.hasOne(RentalAgreement, { foreignKey: 'orderId', as: 'rentalAgreement', onDelete: 'CASCADE' });
RentalAgreement.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
RentalAgreement.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
RentalAgreement.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

// ==========================================
// 5. QUOTATIONS ASSOCIATIONS
// ==========================================
User.hasMany(Quotation, { foreignKey: 'customerId', as: 'customerQuotations' });
Quotation.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

VendorProfile.hasMany(Quotation, { foreignKey: 'vendorId', as: 'vendorQuotations' });
Quotation.belongsTo(VendorProfile, { foreignKey: 'vendorId', as: 'vendor' });

Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items', onDelete: 'CASCADE' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });
QuotationItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ==========================================
// 6. LOGISTICS & QC ASSOCIATIONS
// ==========================================
Booking.hasOne(Pickup, { foreignKey: 'bookingId', as: 'pickup', onDelete: 'CASCADE' });
Pickup.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Booking.hasOne(Return, { foreignKey: 'bookingId', as: 'return', onDelete: 'CASCADE' });
Return.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Return.hasOne(QualityInspection, { foreignKey: 'returnId', as: 'inspection', onDelete: 'CASCADE' });
QualityInspection.belongsTo(Return, { foreignKey: 'returnId', as: 'return' });
QualityInspection.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
QualityInspection.belongsTo(User, { foreignKey: 'inspectedBy', as: 'inspector' });

QualityInspection.hasOne(DamageReport, { foreignKey: 'inspectionId', as: 'damageReport', onDelete: 'CASCADE' });
DamageReport.belongsTo(QualityInspection, { foreignKey: 'inspectionId', as: 'inspection' });
DamageReport.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

// ==========================================
// 7. COMPLAINTS, NOTIFICATIONS & AUDIT ASSOCIATIONS
// ==========================================
User.hasMany(Complaint, { foreignKey: 'userId', as: 'complaints', onDelete: 'CASCADE' });
Complaint.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Complaint.belongsTo(Order, { foreignKey: 'relatedOrderId', as: 'relatedOrder' });
Complaint.belongsTo(User, { foreignKey: 'assignedToAdminId', as: 'assignedAdmin' });

Complaint.hasMany(ComplaintMessage, { foreignKey: 'complaintId', as: 'messages', onDelete: 'CASCADE' });
ComplaintMessage.belongsTo(Complaint, { foreignKey: 'complaintId', as: 'complaint' });
ComplaintMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasMany(PlatformSetting, { foreignKey: 'updatedBy', as: 'updatedSettings' });
PlatformSetting.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

User.hasMany(AuditLog, { foreignKey: 'adminId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

// ==========================================
// 8. REVIEWS & RATINGS ASSOCIATIONS
// ==========================================
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Review, { foreignKey: 'customerId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review', onDelete: 'SET NULL' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  CustomerProfile,
  VendorProfile,
  VendorDocument,
  Category,
  Product,
  ProductImage,
  ProductSpecification,
  Inventory,
  InventoryTransaction,
  Booking,
  BookingItem,
  BookingStatusHistory,
  Order,
  RentalPayment,
  EscrowDeposit,
  Commission,
  Invoice,
  RentalAgreement,
  Quotation,
  QuotationItem,
  Pickup,
  Return,
  QualityInspection,
  DamageReport,
  Complaint,
  ComplaintMessage,
  Notification,
  PlatformSetting,
  AuditLog,
  RefreshToken,
  PasswordResetToken,
  PaymentSubmission,
  Review
};
