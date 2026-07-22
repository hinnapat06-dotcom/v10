import { Patient, Activity, PatientCategory, ActivityType, ActivityStatus } from '../types';

// Standard sheet title in user's Google Drive
const SPREADSHEET_TITLE = 'ตำบลไผ่ต่ำ - ระบบจัดการสุขภาพ';

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'HN001',
    name: 'คุณสมพร รักดี',
    category: 'ติดเตียง',
    address: '45/1 หมู่ 3 ต.ไผ่ต่ำ',
    vitalSigns: 'ความดันสูง 150/90 ชีพจร 82',
    caregiver: 'อสม. สมศรี',
    lat: 14.321,
    lng: 100.812,
    lastVisited: '5 นาทีที่แล้ว',
    phone: '081-234-5678',
  },
  {
    id: 'HN002',
    name: 'คุณวิภา มีสุข',
    category: 'ติดบ้าน',
    address: '12/3 หมู่ 1 ต.ไผ่ต่ำ',
    vitalSigns: 'ความดันปกติ 120/80 ชีพจร 78',
    caregiver: 'อสม. สมชาย',
    lat: 14.324,
    lng: 100.818,
    lastVisited: '20 นาทีที่แล้ว',
    phone: '082-345-6789',
  },
  {
    id: 'HN003',
    name: 'คุณตาบุญมี แข็งแรง',
    category: 'ติดสังคม',
    address: '88/9 หมู่ 2 ต.ไผ่ต่ำ',
    vitalSigns: 'ปกติ ตรวจสุขภาพประจำปีเรียบร้อย',
    caregiver: 'อสม. สมศรี',
    lat: 14.318,
    lng: 100.822,
    lastVisited: '1 ชั่วโมงที่แล้ว',
    phone: '083-456-7890',
  },
  {
    id: 'HN004',
    name: 'คุณยายสายใจ สุขใจ',
    category: 'ติดเตียง',
    address: '10/2 หมู่ 4 ต.ไผ่ต่ำ',
    vitalSigns: 'ความดันปกติ นอนหลับดี รับประทานอาหารได้',
    caregiver: 'อสม. รัตนา',
    lat: 14.320,
    lng: 100.815,
    lastVisited: '1 วันที่แล้ว',
    phone: '084-567-8901',
  },
  {
    id: 'HN005',
    name: 'คุณตาคำดี ใจสบาย',
    category: 'ติดบ้าน',
    address: '55 หมู่ 1 ต.ไผ่ต่ำ',
    vitalSigns: 'ความดันปกติ ปวดเข่าซ้ายเล็กน้อยขณะเดิน',
    caregiver: 'อสม. สมชาย',
    lat: 14.326,
    lng: 100.825,
    lastVisited: '2 วันที่แล้ว',
    phone: '085-678-9012',
  },
  {
    id: 'HN006',
    name: 'คุณยายมาลี เบิกบาน',
    category: 'ติดสังคม',
    address: '111/1 หมู่ 3 ต.ไผ่ต่ำ',
    vitalSigns: 'ปกติ แข็งแรงร่าเริงดี',
    caregiver: 'อสม. รัตนา',
    lat: 14.322,
    lng: 100.828,
    lastVisited: '3 วันที่แล้ว',
    phone: '086-789-0123',
  },
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    timestamp: '5 นาทีที่แล้ว',
    patientName: 'คุณสมพร รักดี',
    caregiverName: 'อสม. สมศรี',
    type: 'แจ้งเตือน',
    description: 'แจ้งเตือนด่วน: คุณสมพร (ติดเตียง) บ้านเลขที่ 45/1 ความดันสูง 150/90',
    status: 'Danger',
  },
  {
    timestamp: '20 นาทีที่แล้ว',
    patientName: 'คุณวิภา มีสุข',
    caregiverName: 'อสม. สมชาย',
    type: 'เข้าเยี่ยม',
    description: 'อสม. สมชาย เข้าเยี่ยม คุณวิภา (ติดบ้าน) บ้านเลขที่ 12/3 เรียบร้อยแล้ว อาการปกติ',
    status: 'Normal',
  },
  {
    timestamp: '1 ชั่วโมงที่แล้ว',
    patientName: 'คุณตาบุญมี แข็งแรง',
    caregiverName: 'อสม. สมศรี',
    type: 'นัดหมาย',
    description: 'นัดหมายกลุ่ม ติดสังคม บ้านเลขที่ 88/9 ตรวจสุขภาพประจำปีและสันทนาการ',
    status: 'Normal',
  },
  {
    timestamp: '1 วันที่แล้ว',
    patientName: 'คุณยายสายใจ สุขใจ',
    caregiverName: 'อสม. รัตนา',
    type: 'เข้าเยี่ยม',
    description: 'อสม. รัตนา เข้าเยี่ยม คุณยายสายใจ ตรวจวัดความดันโลหิตและจัดยาชุดประจำสัปดาห์',
    status: 'Normal',
  },
];

export class SheetsService {
  private accessToken: string;
  private spreadsheetId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Set Authorization headers
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Step 1: Find spreadsheet in Drive or create if not exists
  async getOrCreateSpreadsheet(): Promise<string> {
    if (this.spreadsheetId) return this.spreadsheetId;

    if (!this.accessToken || this.accessToken.trim() === '' || this.accessToken === 'mock-staff-token') {
      throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อเชื่อมต่อ Google Sheets');
    }

    // 1. Check local cache first
    try {
      const cachedId = localStorage.getItem('stitchsync_spreadsheet_id');
      if (cachedId) {
        this.spreadsheetId = cachedId;
        console.log('Using cached Google Spreadsheet ID:', cachedId);
        return cachedId;
      }
    } catch (e) {
      // ignore local storage errors
    }

    // 2. Try searching for existing spreadsheet in Drive
    try {
      const query = encodeURIComponent(`name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: this.getHeaders(),
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.files && searchResult.files.length > 0) {
          this.spreadsheetId = searchResult.files[0].id;
          try {
            localStorage.setItem('stitchsync_spreadsheet_id', this.spreadsheetId!);
          } catch (e) {}
          console.log('Found existing spreadsheet in Drive:', this.spreadsheetId);
          return this.spreadsheetId!;
        }
      } else if (searchResponse.status === 401 || searchResponse.status === 403) {
        throw new Error(`สิทธิ์การเข้าถึง Google Drive ไม่ถูกต้องหรือหมดอายุ (HTTP ${searchResponse.status})`);
      } else {
        const errText = await searchResponse.text().catch(() => '');
        console.warn('Drive search returned non-OK response:', searchResponse.status, errText);
      }
    } catch (searchError: any) {
      if (searchError.message && searchError.message.includes('401')) {
        throw searchError;
      }
      console.warn('Could not search Drive for existing spreadsheet, proceeding to create one:', searchError);
    }

    // 3. Fallback: If not found in Drive or Drive search fails, create a new one directly via Sheets API
    try {
      console.log('Spreadsheet not found or Drive search unavailable. Creating a new spreadsheet via Sheets API...');
      const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
      const createBody = {
        properties: {
          title: SPREADSHEET_TITLE,
        },
        sheets: [
          {
            properties: {
              title: 'Patients',
            },
          },
          {
            properties: {
              title: 'Activities',
            },
          },
        ],
      };

      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(createBody),
      });

      if (!createResponse.ok) {
        if (createResponse.status === 401 || createResponse.status === 403) {
          throw new Error(`ต้องการสิทธิ์ Google OAuth (HTTP ${createResponse.status}) - กรุณาเข้าสู่ระบบ Google อีกครั้ง`);
        }
        const errBody = await createResponse.text().catch(() => '');
        throw new Error(`ไม่สามารถสร้างแผ่นงาน Google Sheets ใหม่ได้ (HTTP ${createResponse.status}): ${errBody}`);
      }

      const createResult = await createResponse.json();
      this.spreadsheetId = createResult.spreadsheetId;
      try {
        localStorage.setItem('stitchsync_spreadsheet_id', this.spreadsheetId!);
      } catch (e) {}
      console.log('Created new spreadsheet ID:', this.spreadsheetId);

      // Populate headers & initial seed data
      await this.initializeSpreadsheet();

      return this.spreadsheetId!;
    } catch (error: any) {
      console.warn('getOrCreateSpreadsheet warning:', error.message || error);
      throw error;
    }
  }

  // Populate newly created sheet with headers & seed data
  private async initializeSpreadsheet() {
    if (!this.spreadsheetId) return;

    try {
      // 1. Patients sheet headers and data
      const patientsRange = 'Patients!A1:J7';
      const patientsValues = [
        ['ID', 'Name', 'Category', 'Address', 'VitalSigns', 'Caregiver', 'Lat', 'Lng', 'LastVisited', 'Phone'],
        ...SEED_PATIENTS.map(p => [
          p.id,
          p.name,
          p.category,
          p.address,
          p.vitalSigns,
          p.caregiver,
          p.lat.toString(),
          p.lng.toString(),
          p.lastVisited,
          p.phone,
        ]),
      ];

      // 2. Activities sheet headers and data
      const activitiesRange = 'Activities!A1:F5';
      const activitiesValues = [
        ['Timestamp', 'PatientName', 'CaregiverName', 'Type', 'Description', 'Status'],
        ...SEED_ACTIVITIES.map(a => [
          a.timestamp,
          a.patientName,
          a.caregiverName,
          a.type,
          a.description,
          a.status,
        ]),
      ];

      // Send update request for Patients
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${patientsRange}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ values: patientsValues }),
        }
      );

      // Send update request for Activities
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${activitiesRange}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ values: activitiesValues }),
        }
      );

      console.log('Successfully initialized spreadsheet with seed data.');
    } catch (error) {
      console.error('Failed to initialize spreadsheet seed data:', error);
    }
  }

  // Get all sheet titles in a spreadsheet
  async getSpreadsheetSheets(spreadsheetId: string): Promise<string[]> {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet names: ${response.statusText}`);
      }
      const data = await response.json();
      return data.sheets?.map((s: any) => s.properties.title) || [];
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw error;
    }
  }

  // Fetch arbitrary values from any sheet and range
  async fetchSheetValues(spreadsheetId: string, sheetName: string, range: string = 'A1:Z500'): Promise<any[][]> {
    try {
      const encodedRange = encodeURIComponent(`${sheetName}!${range}`);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet values: ${response.statusText}`);
      }
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error fetching sheet values:', error);
      throw error;
    }
  }

  // Fetch all Patients
  async fetchPatients(): Promise<Patient[]> {
    const spreadId = await this.getOrCreateSpreadsheet();
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Patients!A2:J1000`;
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch patients values');
      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        return [];
      }

      return data.values.map((row: string[]) => ({
        id: row[0] || '',
        name: row[1] || '',
        category: (row[2] as PatientCategory) || 'ติดสังคม',
        address: row[3] || '',
        vitalSigns: row[4] || '',
        caregiver: row[5] || '',
        lat: parseFloat(row[6]) || 14.321,
        lng: parseFloat(row[7]) || 100.812,
        lastVisited: row[8] || '',
        phone: row[9] || '',
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return default list if sheet fetching fails
      return SEED_PATIENTS;
    }
  }

  // Fetch all Activities
  async fetchActivities(): Promise<Activity[]> {
    const spreadId = await this.getOrCreateSpreadsheet();
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Activities!A2:F1000`;
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch activities values');
      const data = await response.json();

      if (!data.values || data.values.length === 0) {
        return [];
      }

      // Return newer first
      const acts = data.values.map((row: string[]) => ({
        timestamp: row[0] || '',
        patientName: row[1] || '',
        caregiverName: row[2] || '',
        type: (row[3] as ActivityType) || 'เข้าเยี่ยม',
        description: row[4] || '',
        status: (row[5] as ActivityStatus) || 'Normal',
      }));

      return acts.reverse();
    } catch (error) {
      console.error('Error fetching activities:', error);
      return SEED_ACTIVITIES;
    }
  }

  // Add new Patient
  async addPatient(patient: Patient): Promise<boolean> {
    const spreadId = await this.getOrCreateSpreadsheet();
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Patients!A:J:append?valueInputOption=USER_ENTERED`;
      const values = [[
        patient.id,
        patient.name,
        patient.category,
        patient.address,
        patient.vitalSigns,
        patient.caregiver,
        patient.lat.toString(),
        patient.lng.toString(),
        patient.lastVisited,
        patient.phone,
      ]];

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ values }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error appending patient:', error);
      return false;
    }
  }

  // Add new Activity
  async addActivity(activity: Activity): Promise<boolean> {
    const spreadId = await this.getOrCreateSpreadsheet();
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Activities!A:F:append?valueInputOption=USER_ENTERED`;
      const values = [[
        activity.timestamp,
        activity.patientName,
        activity.caregiverName,
        activity.type,
        activity.description,
        activity.status,
      ]];

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ values }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error appending activity:', error);
      return false;
    }
  }

  // Update Patient by ID
  async updatePatient(patient: Patient): Promise<boolean> {
    const spreadId = await this.getOrCreateSpreadsheet();
    try {
      // 1. Fetch current rows to find row index
      const urlFetch = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Patients!A2:A1000`;
      const responseFetch = await fetch(urlFetch, { headers: this.getHeaders() });
      if (!responseFetch.ok) throw new Error('Failed to fetch patient IDs for update');
      const dataFetch = await responseFetch.json();
      
      if (!dataFetch.values || dataFetch.values.length === 0) {
        return false;
      }
      
      const rowIndex = dataFetch.values.findIndex((row: string[]) => row[0] === patient.id);
      if (rowIndex === -1) {
        throw new Error('Patient ID not found in sheet');
      }
      
      const sheetRowNumber = rowIndex + 2; // +2 because 1-based index and header row
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/Patients!A${sheetRowNumber}:J${sheetRowNumber}?valueInputOption=USER_ENTERED`;
      
      const values = [[
        patient.id,
        patient.name,
        patient.category,
        patient.address,
        patient.vitalSigns,
        patient.caregiver,
        patient.lat.toString(),
        patient.lng.toString(),
        patient.lastVisited,
        patient.phone,
      ]];
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ values }),
      });
      
      return updateResponse.ok;
    } catch (error) {
      console.error('Error updating patient:', error);
      return false;
    }
  }
}
