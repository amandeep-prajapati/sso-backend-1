import axios from 'axios';

// SMS Interfaces
interface NovaSMSApiPayload {
  phoneNumber: string;
  recipient: string;
  message: string;
  senderId: string;
  dltEntityId?: string;
  dltTemplateId?: string;
  templateId?: string;
  variables?: Record<string, string>;
  uniqueTransactionNo?: string;
  hasLink?: boolean;
}

interface NovaSMSApiResponse {
  success: boolean;
  message: string;
  data?: any;
  messageId?: string;
}

interface TenantSMSConfig {
  apiKey: string;
  smsHeaderKey?: string;
  templateId?: string;
  senderId?: string;
  dltEntityId?: string;
}

// SMS Templates by Tenant
const SMS_TEMPLATES: { [key: number]: string } = {
//   1: 'Dear User, your secured OTP for CampX login is {#var#}. Do not share this OTP with anyone. Regards, Rupee112',
  1: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Rupee112`,
  2: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Bharat Loan`,
  3: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. BrightLoans`,
  4: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Loan112`,
  5: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Rupee on Time`,
  6: `Dear User,\n{#var#} is your mobile verification code to get login. Please don'\''t share it with anyone - Titan Fincorp`,
  7: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Kreditbuddha`,
  8: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Salary112`,
  9: `Dear User, {#var#} is your mobile verification code. Please don't share it with anyone. Credme`
};


// Get SMS template for tenant
export const getSMSTemplate = (tenantId: number, otp: string): string => {
  const template = SMS_TEMPLATES[tenantId] || SMS_TEMPLATES[1];
  return template.replace('{#var#}', otp);
};

// Generate unique transaction number (12-16 alphanumeric characters)
export const generateUniqueTransactionNo = (): string => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36 (alphanumeric)
  const random = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
  const txnNo = `${timestamp}${random}`.toUpperCase(); // Combine and uppercase
  
  // Ensure it's between 12-16 characters
  if (txnNo.length > 16) {
    return txnNo.substring(0, 16);
  } else if (txnNo.length < 12) {
    // Pad with random alphanumeric if too short
    const padding = Math.random().toString(36).substring(2, 14 - txnNo.length);
    return (txnNo + padding).toUpperCase().substring(0, 16);
  }
  
  return txnNo;
};

// Get tenant-specific SMS API key and header key
export const getTenantSMSConfig = (tenantId?: number): TenantSMSConfig => {
  let selectedApiKey = process.env.NOVA_SMS_API_KEY || '';
  let selectedSmsHeaderKey: string | undefined;
  let selectedTemplateId: string | undefined;
  let selectedSenderId: string | undefined;
  let selectedDltEntityId: string | undefined;

  console.log(`Getting SMS config for tenant ID: ${tenantId}`);

  switch (tenantId) {
    case 1:
      selectedApiKey = process.env.RUPEE112_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_R112_HEADER_KEY;
      selectedTemplateId = process.env.SMS_R112_TEMPLATE_ID;
    selectedSenderId = 'ADHFIN';
      selectedDltEntityId = process.env.SMS_R112_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - Rupee112 SMS config selected`);
      break;
    case 2:
      selectedApiKey = process.env.BHARTALOAN_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_BL_HEADER_KEY;
      selectedTemplateId = process.env.SMS_BL_TEMPLATE_ID;
      selectedSenderId = 'BHRTLN';
      selectedDltEntityId = process.env.SMS_BL_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - BharataLoan SMS config selected`);
      break;
    case 3:
      selectedApiKey = process.env.BRIGHTLOAN_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_BLS_HEADER_KEY;
      selectedTemplateId = process.env.SMS_BLS_TEMPLATE_ID;
      selectedSenderId = 'BRTLN';
      selectedDltEntityId = process.env.SMS_BLS_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - BrightLoan SMS config selected`);
      break;
    case 4:
      selectedApiKey = process.env.LOAN112_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_L112_HEADER_KEY;
      selectedTemplateId = process.env.SMS_L112_TEMPLATE_ID;
      selectedSenderId = 'LOAN12';
      selectedDltEntityId = process.env.SMS_L112_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - Loan112 SMS config selected`);
      break;
    case 5:
      selectedApiKey = process.env.RUPEEONTIME_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_ROT_HEADER_KEY;
      selectedTemplateId = process.env.SMS_ROT_TEMPLATE_ID;
      selectedSenderId = 'RUPTM';
      selectedDltEntityId = process.env.SMS_ROT_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - RupeeOnTime SMS config selected`);
      break;
    case 6:
      selectedApiKey = process.env.TITANFINCOP_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_TITANFINCOP_HEADER_KEY;
      selectedTemplateId = process.env.SMS_TITANFINCOP_TEMPLATE_ID;
      selectedSenderId = 'TTNFNC';
      selectedDltEntityId = process.env.SMS_TITANFINCOP_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - TitanFincop SMS config selected`);
      break;
    case 7:
      selectedApiKey = process.env.KREDITBUDHA_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_KREDITBUDHA_HEADER_KEY;
      selectedTemplateId = process.env.SMS_KREDITBUDHA_TEMPLATE_ID;
      selectedSenderId = 'KRDLN';
      selectedDltEntityId = process.env.SMS_KREDITBUDHA_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - KreditBudha SMS config selected`);
      break;
    case 8:
      selectedApiKey = process.env.SALARY112_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_SALARY112_HEADER_KEY;
      selectedTemplateId = process.env.SMS_SALARY112_TEMPLATE_ID;
      selectedSenderId = 'SAL112';
      selectedDltEntityId = process.env.SMS_SALARY112_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - Salary112 SMS config selected`);
      break;
    case 9:
      selectedApiKey = process.env.CREDME_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_CREDME_HEADER_KEY;
      selectedTemplateId = process.env.SMS_CREDME_TEMPLATE_ID;
      //selectedSenderId = 'CREDME';
      selectedSenderId = 'CMDEX';
      selectedDltEntityId = process.env.SMS_CREDME_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - Credme SMS config selected`);
      break;
    case 10:
      selectedApiKey = process.env.SALARYMANTRA_NOVA_SMS_API_KEY || process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.SMS_SALARYMANTRA_HEADER_KEY;
      selectedTemplateId = process.env.SMS_SALARYMANTRA_TEMPLATE_ID;
      selectedSenderId = 'SALMAN';
      selectedDltEntityId = process.env.SMS_SALARYMANTRA_DLT_ENTITY_ID;
      console.log(`Tenant ${tenantId} - SalaryMantra SMS config selected`);
      break;
    default:
      selectedApiKey = process.env.NOVA_SMS_API_KEY || '';
      selectedSmsHeaderKey = process.env.NOVA_SMS_HEADER_KEY;
      selectedTemplateId = process.env.NOVA_SMS_TEMPLATE_ID;
      selectedSenderId = 'CAMPEX';
      console.log(`Default SMS config selected`);
  }

  console.log(`Final SMS config - API Key: ${selectedApiKey ? 'SET' : 'NOT SET'}, Header Key: ${selectedSmsHeaderKey ? 'SET' : 'NOT SET'}, Template ID: ${selectedTemplateId || 'NOT SET'}, Sender ID: ${selectedSenderId}, DLT Entity ID: ${selectedDltEntityId || 'NOT SET'}`);

  return {
    apiKey: selectedApiKey,
    smsHeaderKey: selectedSmsHeaderKey,
    templateId: selectedTemplateId,
    senderId: selectedSenderId,
    dltEntityId: selectedDltEntityId
  };
}

// Send SMS using Nova SMS API
export const sendSMS = async (
  tenantId: number,
  payload: NovaSMSApiPayload
): Promise<NovaSMSApiResponse> => {
  try {
    const novaSmsApiUrl = process.env.NOVA_SMS_API_URL;
    
    if (!novaSmsApiUrl || novaSmsApiUrl === 'https://api.nova-sms.com/send') {
      throw new Error('NOVA_SMS_API_URL is not configured properly in environment variables');
    }

    const { apiKey, smsHeaderKey } = getTenantSMSConfig(tenantId);
    
    if (!apiKey) {
      throw new Error(`Nova SMS API key not configured for tenant ${tenantId}`);
    }

    // Console log the API call details
    console.log('=== NOVA SMS API CALL ===');
    console.log('URL:', novaSmsApiUrl);
    console.log('Method: POST');
    console.log('Tenant ID:', tenantId);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'x-api-key': apiKey ? '***HIDDEN***' : 'NOT_SET',
      'x-sub-account-id': smsHeaderKey || 'NOT_SET'
    });
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Unique Transaction No:', payload.uniqueTransactionNo);
    console.log('========================');

    const headers: any = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    };

    // Add x-sub-account-id header only if smsHeaderKey exists
    if (smsHeaderKey) {
      headers['x-sub-account-id'] = smsHeaderKey;
    }

    const response = await axios.post<NovaSMSApiResponse>(
      novaSmsApiUrl,
      payload,
      {
        headers: headers,
        timeout: 30000 // 30 second timeout
      }
    );

    // Console log the response
    console.log('=== NOVA SMS API RESPONSE ===');
    console.log('Status Code:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('============================');
console.log(response.data,'response.dataresponse.dataresponse.data')
    return response.data;

  } catch (error: any) {
    console.log('=== NOVA SMS API ERROR ===');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
      console.log('=========================');
      return error.response.data as NovaSMSApiResponse;
    }
    
    console.log('=========================');
    throw new Error(`SMS API Error: ${error.message || 'Network error'}`);
  }
};

// Send OTP SMS
export const 




sendOTPSMS = async (
  tenantId: number,
  phoneNumber: string,
  otp: string,
  expiryMinutes: number = 10
): Promise<NovaSMSApiResponse> => {
  try {
    const { templateId, senderId, dltEntityId } = getTenantSMSConfig(tenantId);
    const uniqueTransactionNo = generateUniqueTransactionNo(); // Generate unique transaction number
    
    // If template ID exists, use it with variables
    if (templateId) {
      const payload: NovaSMSApiPayload = {
        phoneNumber,
        recipient: phoneNumber,
        message: getSMSTemplate(tenantId, otp), // Add message with dynamic OTP
        senderId: senderId || 'CAMPEX',
        dltEntityId,
        dltTemplateId: templateId, // DLT Template ID
        templateId,
        variables: {
          var: otp // Template uses {#var#} placeholder
        },
        uniqueTransactionNo, // Add unique transaction number
        hasLink: false // No link in OTP SMS
      };
      
      console.log('=== SENDING OTP SMS ===');
      console.log('Tenant ID:', tenantId);
      console.log('Phone Number:', phoneNumber);
      console.log('OTP:', otp);
      console.log('Template ID:', templateId);
      console.log('Message:', payload.message);
      console.log('Unique Transaction No:', uniqueTransactionNo);
      console.log('======================');
      
      return await sendSMS(tenantId, payload);
    } else {
      // Fallback to plain message if no template
      const message = getSMSTemplate(tenantId, otp);
      
      const payload: NovaSMSApiPayload = {
        phoneNumber,
        recipient: phoneNumber,
        message,
        senderId: senderId || 'CAMPEX',
        dltEntityId,
        dltTemplateId: templateId, // DLT Template ID
        uniqueTransactionNo, // Add unique transaction number
        hasLink: false // No link in OTP SMS
      };

      console.log('=== SENDING OTP SMS (No Template) ===');
      console.log('Tenant ID:', tenantId);
      console.log('Phone Number:', phoneNumber);
      console.log('OTP:', otp);
      console.log('Sender ID:', senderId);
      console.log('Message:', message);
      console.log('Unique Transaction No:', uniqueTransactionNo);
      console.log('====================================');

      return await sendSMS(tenantId, payload);
    }

  } catch (error: any) {
    console.error('OTP SMS sending failed:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to send OTP SMS'
    };
  }
};

// Helper function to create SMS payload
export const createSMSPayload = (
  phoneNumber: string,
  message: string,
  senderId: string = 'CAMPEX',
  templateId?: string,
  variables?: Record<string, string>
): NovaSMSApiPayload => {
  return {
    phoneNumber,
    recipient: phoneNumber,
    message,
    senderId,
    templateId,
    variables,
    uniqueTransactionNo: generateUniqueTransactionNo(),
    hasLink: false
  };
};
