export const ROLE = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  HOSPITAL: 'HOSPITAL',
  DONOR: 'DONOR',
  ADMIN: 'ADMIN',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const BLOOD_REQUEST_STATUS = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  FULFILLED: 'FULFILLED',
  EXPIRED: 'EXPIRED',
};

export const CONNECTION_STATUS = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const HOSPITAL_FOLLOW_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const RESPONSE_STATUS = {
  OFFERED: 'OFFERED',
  CONTACTED: 'CONTACTED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const NOTIFICATION_TYPE = {
  BLOOD_REQUEST: 'BLOOD_REQUEST',
  HOSPITAL_POST: 'HOSPITAL_POST',
  APPOINTMENT: 'APPOINTMENT',
  MESSAGE: 'MESSAGE',
  REPORT: 'REPORT',
  FOLLOW_UP: 'FOLLOW_UP',
  SYSTEM: 'SYSTEM',
};

export class User {
  constructor({
    id,
    name,
    email,
    role,
    password,
    area,
    profileImage,
    phone,
    isActive = true,
  } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.password = password;
    this.area = area;
    this.profileImage = profileImage || null;
    this.phone = phone || null;
    this.isActive = isActive;
  }
}

export class PatientProfile extends User {
  constructor(data = {}) {
    super(data);
    this.bloodGroup = data.bloodGroup || null;
    this.age = data.age || null;
    this.followedHospitals = data.followedHospitals || [];
  }
}

export class DoctorProfile extends User {
  constructor(data = {}) {
    super(data);
    this.specialization = data.specialization || 'General Medicine';
    this.hospitalId = data.hospitalId || null;
    this.experience = data.experience || '5+ years';
    this.about = data.about || 'Care-focused specialist';
    this.rating = data.rating || 4.8;
    this.reviewCount = data.reviewCount || 0;
    this.isVerified = data.isVerified ?? true;
    this.available = data.available ?? true;
    this.area = data.area || 'Islamabad';
  }
}

export class DoctorConnection {
  constructor({
    id,
    patientId,
    doctorId,
    status = CONNECTION_STATUS.PENDING,
    createdAt,
    acceptedAt = null,
    rejectedAt = null,
    notes = '',
  } = {}) {
    this.id = id;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.status = status;
    this.createdAt = createdAt || new Date().toISOString();
    this.acceptedAt = acceptedAt;
    this.rejectedAt = rejectedAt;
    this.notes = notes;
  }
}

export const isMessagingAvailable = (connectionStatus) =>
  connectionStatus === CONNECTION_STATUS.ACCEPTED;

export class HospitalProfile {
  constructor({
    id,
    name,
    description,
    area,
    phone,
    verificationStatus = 'VERIFIED',
    followers = 0,
    services = [],
    doctors = [],
    logoUrl = null,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description || 'Committed to patient-centered care.';
    this.area = area || 'Islamabad';
    this.phone = phone || null;
    this.verificationStatus = verificationStatus;
    this.followers = followers;
    this.services = services;
    this.doctors = doctors;
    this.logoUrl = logoUrl;
  }
}

export class DonorProfile extends User {
  constructor(data = {}) {
    super(data);
    this.age = data.age || 28;
    this.bloodGroup = data.bloodGroup || 'O+';
    this.availability = data.availability || 'Available';
    this.area = data.area || 'Islamabad';
    this.cnicMasked = data.cnicMasked || '*****-*******-*';
    this.followedHospitals = data.followedHospitals || [];
  }
}

export class HospitalFollow {
  constructor({ id, hospitalId, userId, createdAt, isActive = true } = {}) {
    this.id = id;
    this.hospitalId = hospitalId;
    this.userId = userId;
    this.createdAt = createdAt || new Date().toISOString();
    this.isActive = isActive;
  }
}

export class HospitalPost {
  constructor({
    id,
    hospitalId,
    postType,
    title,
    description,
    bloodGroup,
    unitsRequired,
    urgency,
    location,
    contactInformation,
    createdAt,
    expiryDate,
    status = 'ACTIVE',
    imageUrl = null,
  } = {}) {
    this.id = id;
    this.hospitalId = hospitalId;
    this.postType = postType;
    this.title = title;
    this.description = description;
    this.bloodGroup = bloodGroup || null;
    this.unitsRequired = unitsRequired || 0;
    this.urgency = urgency || 'NORMAL';
    this.location = location || 'Islamabad';
    this.contactInformation = contactInformation || 'Hospital coordination team';
    this.createdAt = createdAt || new Date().toISOString();
    this.expiryDate = expiryDate || null;
    this.status = status;
    this.imageUrl = imageUrl;
  }
}

export class BloodRequest extends HospitalPost {
  constructor(data = {}) {
    super({ ...data, postType: data.postType || 'BLOOD_NEEDED' });
    this.hospitalId = data.hospitalId;
    this.bloodGroup = data.bloodGroup || 'O+';
    this.unitsRequired = data.unitsRequired || 1;
    this.urgency = data.urgency || 'URGENT';
    this.status = data.status || BLOOD_REQUEST_STATUS.ACTIVE;
    this.responseCount = data.responseCount || 0;
  }
}

export class BloodRequestResponse {
  constructor({
    id,
    bloodRequestId,
    donorId,
    createdAt,
    status = RESPONSE_STATUS.OFFERED,
    message = 'I can help.',
  } = {}) {
    this.id = id;
    this.bloodRequestId = bloodRequestId;
    this.donorId = donorId;
    this.createdAt = createdAt || new Date().toISOString();
    this.status = status;
    this.message = message;
  }
}

export class Appointment {
  constructor({
    id,
    patientId,
    doctorId,
    hospitalId,
    date,
    time,
    status = APPOINTMENT_STATUS.PENDING,
    notes = '',
  } = {}) {
    this.id = id;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.hospitalId = hospitalId;
    this.date = date;
    this.time = time;
    this.status = status;
    this.notes = notes;
  }
}

export class DoctorAvailability {
  constructor({ doctorId, date, slots = [] } = {}) {
    this.doctorId = doctorId;
    this.date = date;
    this.slots = slots;
  }
}

export class Message {
  constructor({ id, senderId, receiverId, conversationId, body, attachments = [], createdAt, read=false } = {}) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.conversationId = conversationId;
    this.body = body;
    this.attachments = attachments;
    this.createdAt = createdAt || new Date().toISOString();
    this.read = read;
  }
}

export class Conversation {
  constructor({ id, participantIds = [], lastMessage } = {}) {
    this.id = id;
    this.participantIds = participantIds;
    this.lastMessage = lastMessage || null;
  }
}

export class MedicalReport {
  constructor({
    id,
    userId,
    fileName,
    fileType,
    uploadedAt,
    extractedInformation = {},
    aiSummaryUrdu = '',
    importantFindings = [],
    sharedWithDoctorId = null,
    isProcessed = false,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.uploadedAt = uploadedAt || new Date().toISOString();
    this.extractedInformation = extractedInformation;
    this.aiSummaryUrdu = aiSummaryUrdu;
    this.importantFindings = importantFindings;
    this.sharedWithDoctorId = sharedWithDoctorId;
    this.isProcessed = isProcessed;
  }
}

export class ReportSummary {
  constructor({
    id,
    reportId,
    summaryUrdu,
    importantFindings,
    abnormalValues,
    plainLanguage,
    questions,
    disclaimer,
  } = {}) {
    this.id = id;
    this.reportId = reportId;
    this.summaryUrdu = summaryUrdu;
    this.importantFindings = importantFindings;
    this.abnormalValues = abnormalValues;
    this.plainLanguage = plainLanguage;
    this.questions = questions;
    this.disclaimer = disclaimer || 'AI-generated information is informational only and is not a diagnosis.';
  }
}

export class Prescription {
  constructor({ id, userId, scanDate, medicines = [], notes = '' } = {}) {
    this.id = id;
    this.userId = userId;
    this.scanDate = scanDate || new Date().toISOString();
    this.medicines = medicines;
    this.notes = notes;
  }
}

export class PrescriptionMedicine {
  constructor({
    id,
    medicineName,
    strength,
    dose,
    frequency,
    duration,
    confidence = '0%',
    source = 'Demo catalogue',
  } = {}) {
    this.id = id;
    this.medicineName = medicineName;
    this.strength = strength;
    this.dose = dose;
    this.frequency = frequency;
    this.duration = duration;
    this.confidence = confidence;
    this.source = source;
  }
}

export class MedicinePrice {
  constructor({ id, medicineName, price, currency = 'PKR', source = 'Demo Price', lastUpdated } = {}) {
    this.id = id;
    this.medicineName = medicineName;
    this.price = price;
    this.currency = currency;
    this.source = source;
    this.lastUpdated = lastUpdated || new Date().toISOString();
  }
}

export class DoctorReview {
  constructor({ id, doctorId, patientId, rating, comment, createdAt } = {}) {
    this.id = id;
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt || new Date().toISOString();
  }
}

export class Notification {
  constructor({
    id,
    userId,
    type,
    title,
    body,
    hospitalId = null,
    postId = null,
    bloodRequestId = null,
    createdAt,
    isRead = false,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.body = body;
    this.hospitalId = hospitalId;
    this.postId = postId;
    this.bloodRequestId = bloodRequestId;
    this.createdAt = createdAt || new Date().toISOString();
    this.isRead = isRead;
  }
}

export const createDemoDisclaimer = () =>
  'AI-generated information is provided for informational and organizational purposes only. It is not a diagnosis, prescription, or substitute for professional medical advice.';
