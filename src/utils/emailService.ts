import axios from 'axios';

// Email Templates
export const getOTPEmailTemplate = (otp: string, companyName: string, expiryMinutes: number = 10) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            @media only screen and (max-width: 600px) {
                .container { padding: 20px !important; }
                .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
                .company-name { font-size: 24px !important; }
                .content-text { font-size: 14px !important; }
            }
            @media only screen and (max-width: 480px) {
                .container { padding: 15px !important; }
                .otp-code { font-size: 24px !important; letter-spacing: 3px !important; padding: 12px 20px !important; }
                .company-name { font-size: 20px !important; }
                .otp-box { padding: 20px !important; }
            }
        </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4; width: 100% !important; min-width: 100%;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
                        <tr>
                            <td>
                                <div class="container" style="background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); margin: 0 auto;">
                                    <!-- Header -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                                        <tr>
                                            <td align="center">
                                                <div class="company-name" style="font-size: 28px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">${companyName}</div>
                                                <h2 style="color: #2c3e50; margin: 0; font-size: 22px;">Email Verification</h2>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Content -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td>
                                                <p class="content-text" style="color: #333333; font-size: 16px; margin: 0 0 15px 0;">Hello,</p>
                                                
                                                <p class="content-text" style="color: #333333; font-size: 16px; margin: 0 0 25px 0;">We received a request to verify your email address. Please use the following One-Time Password (OTP) to complete your verification:</p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- OTP Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <div class="otp-box" style="background-color: #4a5568; padding: 25px; border-radius: 8px; border: 3px solid #2d3748; text-align: center;">
                                                    <div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 15px;">Your OTP Code</div>
                                                    <div class="otp-code" style="background-color: #ffffff; color: #000000; font-size: 36px; font-weight: bold; letter-spacing: 6px; padding: 15px 25px; border-radius: 5px; font-family: 'Courier New', monospace; border: 2px solid #4a5568; display: inline-block; margin: 0 auto;">${otp}</div>
                                                    <div style="color: #ffffff; font-size: 14px; margin-top: 15px; font-weight: 500;">Valid for ${expiryMinutes} minutes</div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Warning Box -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                                        <tr>
                                            <td>
                                                <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px;">
                                                    <strong>⚠️ Security Notice:</strong>
                                                    <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                                                        <li style="margin: 5px 0;">This OTP is valid for ${expiryMinutes} minutes only</li>
                                                        <li style="margin: 5px 0;">Do not share this code with anyone</li>
                                                        <li style="margin: 5px 0;">If you didn't request this, please ignore this email</li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Support Text -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td>
                                                <p class="content-text" style="color: #333333; font-size: 16px; margin: 20px 0;">If you're having trouble, please contact our support team.</p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Footer -->
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                                        <tr>
                                            <td align="center" style="color: #666666; font-size: 14px;">
                                                <p style="margin: 0 0 10px 0;">This is an automated message from ${companyName}.<br>
                                                Please do not reply to this email.</p>
                                                <p style="margin: 15px 0 0 0;">
                                                    <strong>Need Help?</strong> Contact our support team
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  const textTemplate = `
    ${companyName} - Email Verification
    
    Hello,
    
    We received a request to verify your email address. Please use the following One-Time Password (OTP) to complete your verification:
    
    ================================
    YOUR OTP CODE: ${otp}
    ================================
    
    This code is valid for ${expiryMinutes} minutes only.
    
    Security Notice:
    - Do not share this code with anyone
    - If you didn't request this, please ignore this email
    
    If you're having trouble, please contact our support team.
    
    This is an automated message from ${companyName}.
    Please do not reply to this email.
  `;

  return {
    html: htmlTemplate,
    text: textTemplate
  };
};

// Generate alphanumeric unique transaction number (12-16 characters)
export const generateUniqueTransactionNo = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 14; i++) { // 14 characters (within 12-16 range)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
interface EmailDestination {
  destination: string;
}

interface EmailRecipient {
  to: EmailDestination[];
}

interface EmailContent {
  subject: string;
  text: string;
  html?: string;
}

interface EmailMessage {
  sender: string;
  destinations: EmailRecipient[];
  content: EmailContent;
}

interface EmailTracking {
  track: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
}

interface EmailOptions {
  tracking: EmailTracking;
  clientPriority: 'STANDARD' | 'HIGH' | 'LOW';
}

interface EmailRequest {
  leadId?: string;
  uniqueTransactionNo: string;
  isTransactional: boolean;
  messages: EmailMessage[];
  options: EmailOptions;
}

interface EmailResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface TenantEmailConfig {
  apiKey: string;
  fromEmail: string;
}

// Get tenant-specific email API key and from email
export const getTenantEmailConfig = (tenantId?: number): TenantEmailConfig => {
  let selectedApiKey = process.env.EMAIL_API_KEY || '';
  let selectedFromEmail = process.env.DEFAULT_FROM_EMAIL || '';
  
  console.log(`Getting email config for tenant ID: ${tenantId}`);
  console.log(`Available env vars:`, {
    EMAIL_API_KEY: process.env.EMAIL_API_KEY ? 'SET' : 'NOT SET',
    DEFAULT_FROM_EMAIL: process.env.DEFAULT_FROM_EMAIL ? 'SET' : 'NOT SET',
    RUPEE112_EMAIL_API_KEY: process.env.RUPEE112_EMAIL_API_KEY ? 'SET' : 'NOT SET',
    BHARATALOAN_EMAIL_API_KEY: process.env.BHARATALOAN_EMAIL_API_KEY ? 'SET' : 'NOT SET'
  });
  
  switch (tenantId) {
    case 1:
      selectedApiKey = process.env.RUPEE112_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.RUPEE112_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: Rupee112, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 2:
      selectedApiKey = process.env.BHARTLOAN_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.BHARATLOAN_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: BhartaLoan, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 3:
      selectedApiKey = process.env.BRIGHTLOAN_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.BRIGHTLOAN_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: BrightLoan, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 4:
      selectedApiKey = process.env.LOAN112_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.LOAN112_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: Loan112, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 5:
      selectedApiKey = process.env.RUPEEONTIME_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.RUPEEONTIME_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: RupeeOnTime, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 6:
      selectedApiKey = process.env.TITANFINCORP_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.TITANFINCORP_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: TitanFincorp, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 7:
      selectedApiKey = process.env.KREDITBUDDHA_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.KREDITBUDDHA_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: KreditBuddha, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    case 8:
      selectedApiKey = process.env.SALARY112_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.SALARY112_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: Salary112, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;

    case 9:
      selectedApiKey = process.env.CREDME_EMAIL_API_KEY || '';
      selectedFromEmail = process.env.CREDME_FROM_EMAIL || '';
      console.log(`Tenant ${tenantId} selected - Email API Key: Salary112, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
      break;
    default:
      selectedApiKey = process.env.EMAIL_API_KEY || '';
      selectedFromEmail = process.env.DEFAULT_FROM_EMAIL || '';
      console.log(`Default Email API Key selected, Key: ${selectedApiKey ? 'SET' : 'NOT SET'}`);
  }
  
  console.log(`Final config - API Key: ${selectedApiKey ? 'SET' : 'NOT SET'}, From Email: ${selectedFromEmail}`);
  
  return {
    apiKey: selectedApiKey,
    fromEmail: selectedFromEmail
  };
};

// Get tenant-specific email API key (backward compatibility)
export const getTenantEmailApiKey = (tenantId?: number): string => {
  return getTenantEmailConfig(tenantId).apiKey;
};

// Send email using Lendix API
export const sendEmail = async (
  tenantId: number,
  emailData: EmailRequest
): Promise<EmailResponse> => {
  try {
    const { apiKey, fromEmail } = getTenantEmailConfig(tenantId);
    const apiUrl = process.env.EMAIL_API_URL || 'https://api.lendix.ai/email/send';

    if (!apiKey) {
      throw new Error('Email API key not found for tenant');
    }

    // Update sender email if not provided
    if (emailData.messages && emailData.messages.length > 0) {
      emailData.messages[0].sender = emailData.messages[0].sender || fromEmail;
    }

    console.log('=== EMAIL REQUEST DEBUG ===');
    console.log('API URL:', apiUrl);
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT SET');
    console.log('From Email:', fromEmail);
    console.log('Tenant ID:', tenantId);
    console.log('Email Data:', JSON.stringify(emailData, null, 2));
    console.log('Request Headers:', {
      'x-api-key': apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT SET',
      'Content-Type': 'application/json'
    });
    console.log('=== END EMAIL REQUEST DEBUG ===');

    const response = await axios.post(apiUrl, emailData, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('=== EMAIL RESPONSE SUCCESS ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('=== END EMAIL RESPONSE SUCCESS ===');

    return {
      success: true,
      message: 'Email sent successfully',
      data: response.data
    };

  } catch (error: any) {
    console.log('=== EMAIL ERROR DEBUG ===');
    console.log('Error Message:', error.message);
    console.log('Error Status:', error.response?.status);
    console.log('Error Status Text:', error.response?.statusText);
    console.log('Error Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Error Response Headers:', error.response?.headers);
    console.log('Request Config URL:', error.config?.url);
    console.log('Request Config Method:', error.config?.method);
    console.log('Request Config Data:', error.config?.data);
    console.log('Request Config Headers:', error.config?.headers);
    console.log('=== END EMAIL ERROR DEBUG ===');
    
    return {
      success: false,
      message: error.message || 'Failed to send email',
      data: error.response?.data
    };
  }
};

// Send OTP email
export const sendOTPEmail = async (
  tenantId: number,
  recipientEmail: string,
  otp: string,
  leadId?: string,
  expiryMinutes: number = 10
): Promise<EmailResponse> => {
  try {
    const { fromEmail } = getTenantEmailConfig(tenantId);
    
    // Get company name based on tenant
    const companyNames: { [key: number]: string } = {
      1: 'Rupee112',
      2: 'BhartaLoan',
      3: 'BrightLoans',
      4: 'Loan112',
      5: 'RupeeOnTime',
      6: 'TitanFincorp',
      7: 'KreditBuddha',
      8: 'Salary112',
      9: 'Credme'
    };
    
    const companyName = companyNames[tenantId] || 'Lendix';
    const template = getOTPEmailTemplate(otp, companyName, expiryMinutes);
    
    const emailRequest: EmailRequest = {
      uniqueTransactionNo: generateUniqueTransactionNo(),
      isTransactional: true,
      messages: [{
        sender: fromEmail,
        destinations: [{
          to: [{ destination: recipientEmail }]
        }],
        content: {
          subject: `${companyName} - Email Verification Code`,
          text: template.text,
          html: template.html
        }
      }],
      options: {
        tracking: {
          track: true,
          trackOpens: true,
          trackClicks: false
        },
        clientPriority: 'HIGH'
      }
    };

    return await sendEmail(tenantId, emailRequest);

  } catch (error: any) {
    console.error('OTP email sending failed:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to send OTP email',
      data: error.response?.data
    };
  }
};

// Helper function to create email request object
export const createEmailRequest = (
  tenantId: number,
  leadId: string,
  recipients: string[],
  subject: string,
  textContent: string,
  htmlContent?: string,
  customSender?: string
): EmailRequest => {
  const { fromEmail } = getTenantEmailConfig(tenantId);
  const sender = customSender || fromEmail;

  return {
    uniqueTransactionNo: generateUniqueTransactionNo(),
    isTransactional: true,
    messages: [{
      sender,
      destinations: [{
        to: recipients.map(email => ({ destination: email }))
      }],
      content: {
        subject,
        text: textContent,
        html: htmlContent
      }
    }],
    options: {
      tracking: {
        track: true,
        trackOpens: true,
        trackClicks: true
      },
      clientPriority: 'STANDARD'
    }
  };
};