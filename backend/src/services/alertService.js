const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const { publishAlertCreated, publishAlertUpdated } = require('./alertPublisher');

exports.getAlerts = async (filters = {}) => {
  const query = {};

  if (filters.severity) {
    query.severity = filters.severity;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead === 'true';
  }

  return Alert.find(query).sort({ createdAt: -1 });
};

exports.createAlert = async (payload) => {
  const alert = await Alert.create(payload);
  publishAlertCreated(alert);
  return alert;
};

exports.markAlertAsRead = async (id) => {
  const alert = await Alert.findByIdAndUpdate(
    id,
    { isRead: true, readAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  publishAlertUpdated(alert);
  return alert;
};
