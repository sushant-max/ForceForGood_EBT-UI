// 1. Device Detail Interface
export interface DeviceDetail {
    device_id: string;
    device_manufacturer: string;
    device_model: string;
    notification_token: string;
    // Use a union type for known status values
    signin_status: 'signed_in' | 'signed_out' | string;
}

// 2. Address Interface
export interface Address {
    city: string;
    country: string;
    default_address: boolean;
    door_number: string;
    land_mark: string;
    pinCode: string;
    state: string;
    street: string;
}

// 3. User Addresses Interface (Handles the dynamic 'Home', 'Work', etc. keys)
export interface UserAddresses {
    // Use an index signature (or Record<string, ...>) to allow any key 
    // that points to an array of Address objects
    [key: string]: Address[];
}

// 4. User Details Interface
export interface UserDetails {
    email_id: string;
    name: string;
    addresses: UserAddresses;
    gender: 'Male' | 'Female' | 'Other' | string;
    profile_photo_uri: string;
    date_of_birth: string; // Assuming 'DD/MM/YYYY' format as a string
    contact_number: string;
}

// 5. Main User Profile Interface
export interface UserProfile {
    // Firestore Document ID (often optional if not coming directly from the DB)
    id: string; 
    user_uid: string;
    license_id: string;
    license_key: string;
    device_details: DeviceDetail[];
    user_details: UserDetails;
    geohash: string;
    // Lat/Long are strings in your JSON, so they should be typed as such
    latitude: string; 
    longitude: string;
    pinCode: string;
    // Use a union type for known status values
    registration_status: 'active' | 'pending' | 'inactive';
    register_date: string;
    user_roles: string[];
    corporateId: string;
    // Use null or a specific string for optional/nullable fields
    corporate_name: string | null;
}

// 1. Interface for a single document entry
export interface Document {
    // Using a union type for specific document types makes the interface safer
    type: 'PAN_CARD' | 'GST_CERTIFICATE' | 'OTHER';
    url: string; // The URL pointing to the document
}

// 2. Interface for the main corporate registration payload
export interface CorporateRegistration {
    companyName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string; // Stored as a string to preserve leading zeros if any
    country: string;
    phoneNumber: string; // Includes country code and formatting
    panNumber: string;
    gstNumber: string;
    licensesNeeded: number; // Number of licenses requested
    
    // Contact Person Details
    name: string;
    emailId: string;
    password: string; // Note: In a real system, this should be securely hashed before storage
    
    // Array of uploaded documents
    documents: Document[];
}

export interface IndividualRegistration {
    name: string;
    emailId: string;
    password: string;
    documents: Document[];
}

export interface CorporateDocument {
    // Use a union type for specific known document types
    type: 'PAN_CARD' | 'GST_CERTIFICATE' | 'OTHER';
    url: string; // URL to the hosted document
}

/**
 * Interface for the nested 'user_details' inside the admin object.
 */
export interface AdminUserDetails {
    email_id: string;
    name: string;
}

/**
 * Interface for the nested 'admin' object.
 */
export interface CorporateAdmin {
    id: string; // Firestore Document ID for the admin user
    corporateId: string; // UUID of the parent corporate record
    registration_status: 'active' | 'pending' | 'inactive' | 'rejected' |string;
    user_details: AdminUserDetails;
    user_roles: string[]; // e.g., ['corporate_admin']
    register_date: string; // Assuming 'MM/D/YYYY' date string format
    user_uid: string; // The admin's unique user identifier (UUID)
}


// --- 2. Main Interface ---

/**
 * Interface for a single Corporate Registration record.
 */
export interface CorporateRecord {
    id: string; // Firestore Document ID for the corporate record
    address: string;
    city: string;
    corporate_name: string;
    country: string;
    // Firestore Timestamps are often returned as ISO strings in API responses
    created_at: string; 
    corporate_email: string;
    gst_number: string;
    pan_number: string;
    contact_number: string;
    postalCode: string;
    state: string;
    status: 'pending' | 'approved' | 'rejected';
    documents: CorporateDocument[];
    corporate_id: string; // The corporate's unique UUID identifier
    admin: CorporateAdmin;
    approvalDate: string | null; // Nullable date string for when the corporate was approved
    rejectionDate: string | null; // Nullable date string for when the corporate was rejected
    rejectionReason: string | null; // Nullable string for rejection reason
}