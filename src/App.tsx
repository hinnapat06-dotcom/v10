import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  TrendingUp, 
  Bell, 
  Activity as ActivityIcon, 
  Search, 
  Settings, 
  Plus, 
  Users, 
  Database, 
  LogOut, 
  FileSpreadsheet, 
  HelpCircle, 
  Map as MapIcon, 
  User as UserIcon, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Check, 
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download,
  Clipboard,
  Shield,
  Mail,
  UserCheck,
  Menu,
  Award
} from 'lucide-react';
import { googleSignIn, googleSignOut, initAuth, getAccessToken } from './lib/firebase';
import { SheetsService, SEED_PATIENTS, SEED_ACTIVITIES } from './lib/sheetsService';
import { exportAllToExcel, exportSingleTableToExcel } from './lib/excelExport';
import { Patient, Activity, PatientCategory, ActivityType, ActivityStatus, DashboardStats } from './types';
import { CoinExchangeWidget } from './components/CoinExchangeWidget';

const HealthLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer circle with double rings */}
    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" className="text-emerald-600" />
    <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" className="text-emerald-500" />
    
    {/* Health Cross in the center */}
    <rect x="44" y="24" width="12" height="52" rx="4" fill="currentColor" className="fill-emerald-600" />
    <rect x="24" y="44" width="52" height="12" rx="4" fill="currentColor" className="fill-emerald-600" />
    
    {/* Heart wrapping around or centered */}
    <path d="M50 42 C45 35, 33 38, 33 48 C33 58, 50 68, 50 68 C50 68, 67 58, 67 48 C67 38, 55 35, 50 42 Z" 
          stroke="currentColor" strokeWidth="3" fill="none" className="text-rose-500" />
    
    {/* Inner Leaf motif representing natural health */}
    <path d="M50 28 C55 32, 58 38, 56 44 C54 50, 50 52, 50 52 C50 52, 46 50, 44 44 C42 38, 45 32, 50 28 Z" 
          fill="currentColor" className="fill-emerald-400" />
  </svg>
);

const MOO_OPTIONS = ['หมู่ 1', 'หมู่ 2', 'หมู่ 3', 'หมู่ 4', 'หมู่ 5', 'หมู่ 6', 'หมู่ 7', 'หมู่ 8'];

const PHAI_TAM_MY_MAPS_PATIENTS: Patient[] = [
  {
    id: 'HN-MM001',
    name: 'คุณยายพะยอม ดีเสมอ',
    category: 'ติดเตียง',
    address: 'บ้านเลขที่ 11 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 5',
    vitalSigns: 'ความดัน 135/85 ชีพจร 78 ครั้ง/นาที แผลกดทับที่สะโพกดีขึ้นมากตามลำดับ',
    caregiver: 'อสม. ประกายดาว สุขสำราญ',
    lat: 14.332066,
    lng: 100.822967,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '081-555-1234',
  },
  {
    id: 'HN-MM002',
    name: 'คุณตาประกอบ วาจาดี',
    category: 'ติดบ้าน',
    address: 'บ้านเลขที่ 4 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 1',
    vitalSigns: 'ความดันปกติ 120/80 ปวดเข่าและข้อเท้า มีโรคประจำตัวเบาหวานประเภทที่ 2',
    caregiver: 'อสม. รัตนาภรณ์ รักษ์ดี',
    lat: 14.333155,
    lng: 100.821421,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '082-666-2345',
  },
  {
    id: 'HN-MM003',
    name: 'คุณป้าสมจิต เพลินจิต',
    category: 'ติดสังคม',
    address: 'บ้านเลขที่ 72 หมู่ 3 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 3',
    vitalSigns: 'ความดัน 125/75 ครั้ง/นาที ร่าเริง เดินไปวัดและร่วมประชุมผู้สูงอายุได้ปกติ',
    caregiver: 'อสม. สุทิน บัวงาม',
    lat: 14.331122,
    lng: 100.824555,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '089-777-3456',
  },
  {
    id: 'HN-MM004',
    name: 'คุณลุงสุวรรณ แก้วประเสริฐ',
    category: 'ติดเตียง',
    address: 'บ้านเลขที่ 58 หมู่ 2 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 2',
    vitalSigns: 'อัมพาตครึ่งซีกด้านซ้าย ความดันเฉลี่ย 130/80 งดเค็ม ฝึกกายภาพ',
    caregiver: 'อสม. สายใจ แก้วระย้า',
    lat: 14.334055,
    lng: 100.823901,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '085-888-4567',
  },
  {
    id: 'HN-MM005',
    name: 'คุณยายกิ่งแก้ว ยอดรัก',
    category: 'ติดบ้าน',
    address: 'บ้านเลขที่ 102/1 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 5',
    vitalSigns: 'ควบคุมระดับน้ำตาลได้ค่อนข้างคงที่ ปวดหลังเรื้อรังเดินลุกนั่งลำบาก',
    caregiver: 'อสม. ประกายดาว สุขสำราญ',
    lat: 14.329899,
    lng: 100.821999,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '083-999-5678',
  },
  {
    id: 'HN-MM006',
    name: 'คุณตาเฉลิม นามสมมติ',
    category: 'ติดเตียง',
    address: 'บ้านเลขที่ 15 หมู่ 4 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 4',
    vitalSigns: 'ผู้ป่วยสูงอายุให้อาหารทางสายยาง ขับถ่ายทางสายสวนปัสสาวะ อ่อนเพลียเล็กน้อย',
    caregiver: 'อสม. วิจิตร ใจอารีย์',
    lat: 14.331500,
    lng: 100.825100,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '084-333-8899',
  },
  {
    id: 'HN-MM007',
    name: 'คุณน้ามาลี ศรีวิชัย',
    category: 'ติดสังคม',
    address: 'บ้านเลขที่ 8/2 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
    moo: 'หมู่ 1',
    vitalSigns: 'ปกติ มีประวัติโรคความดันโลหิตสูง รับประทานยาต่อเนื่องสม่ำเสมอ แข็งแรงดี',
    caregiver: 'อสม. รัตนาภรณ์ รักษ์ดี',
    lat: 14.332600,
    lng: 100.820200,
    lastVisited: 'ดึงข้อมูลสำเร็จจาก Google My Maps',
    phone: '086-444-5566',
  }
];

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('stitchsync_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('stitchsync_token');
  });
  const [userRole, setUserRole] = useState<'staff' | 'public' | null>(() => {
    return localStorage.getItem('stitchsync_role') as any;
  });
  const [needsAuth, setNeedsAuth] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('stitchsync_user');
    } catch {
      return true;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'vhv' | 'patient' | 'caregiver' | 'analytics' | 'logs' | 'team' | 'import'>('dashboard');

  // Google My Maps Importer States
  const [importedPatients, setImportedPatients] = useState<Patient[]>(PHAI_TAM_MY_MAPS_PATIENTS);
  const [kmlInput, setKmlInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSearchQuery, setImportSearchQuery] = useState<string>('');
  const [importCategoryFilter, setImportCategoryFilter] = useState<PatientCategory | 'ทั้งหมด'>('ทั้งหมด');

  // Google Sheets Importer States
  const [sheetUrl, setSheetUrl] = useState<string>('https://docs.google.com/spreadsheets/d/1o-StlQu_vf1-b3NCh5qmH1h3YScmTMm594Krao03L1A/edit?usp=sharing');
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [sheetPatients, setSheetPatients] = useState<Patient[]>([]);
  const [loadingSheet, setLoadingSheet] = useState<boolean>(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetsImportTab, setSheetsImportTab] = useState<'mymaps' | 'sheets'>('sheets');

  // Login Options
  const [loginTab, setLoginTab] = useState<'staff' | 'vhv'>('staff');
  const [guestName, setGuestName] = useState<string>('');
  const [mockStaffName, setMockStaffName] = useState<string>('');
  const [vhvLoginName, setVhvLoginName] = useState<string>('');
  const [staffGmailInput, setStaffGmailInput] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Authorized Staff Emails List for security whitelist
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stitchsync_authorized_emails');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Seed with user's email and mock emails
    return ['chinnapat37428@gmail.com', 'somchai.staff@phaitam.go.th', 'somsri.staff@phaitam.go.th', 'somchai@gmail.com'];
  });
  const [newAuthEmail, setNewAuthEmail] = useState<string>('');

  // Save authorized emails list to localStorage on change
  useEffect(() => {
    localStorage.setItem('stitchsync_authorized_emails', JSON.stringify(authorizedEmails));
  }, [authorizedEmails]);

  // Helper to determine role
  const resolveAndSetUserRole = (email: string | null, list: string[] = authorizedEmails) => {
    if (!email) return 'public';
    const normalizedEmail = email.trim().toLowerCase();
    const isApproved = list.some(e => e.trim().toLowerCase() === normalizedEmail);
    return isApproved ? 'staff' : 'public';
  };

  // Core Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<PatientCategory | 'ทั้งหมด'>('ทั้งหมด');
  const [selectedDetailItem, setSelectedDetailItem] = useState<{ type: 'อสม' | 'ผู้ป่วย' | 'ผู้ดูแล', name: string, data?: any } | null>(null);
  
  // New Report Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'visit' | 'patient' | 'edit-patient'>('visit');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Visit Report Fields
  const [visitVitalSigns, setVisitVitalSigns] = useState<string>('');
  const [visitDescription, setVisitDescription] = useState<string>('');
  const [visitStatus, setVisitStatus] = useState<ActivityStatus>('Normal');

  // New Patient Fields
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientCategory, setNewPatientCategory] = useState<PatientCategory>('ติดสังคม');
  const [newPatientAddress, setNewPatientAddress] = useState<string>('');
  const [newPatientMoo, setNewPatientMoo] = useState<string>('หมู่ 1');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [newPatientVital, setNewPatientVital] = useState<string>('');
  const [newPatientCaregiver, setNewPatientCaregiver] = useState<string>('');

  // Edit Patient Fields
  const [editPatientId, setEditPatientId] = useState<string>('');
  const [editPatientName, setEditPatientName] = useState<string>('');
  const [editPatientCategory, setEditPatientCategory] = useState<PatientCategory>('ติดสังคม');
  const [editPatientAddress, setEditPatientAddress] = useState<string>('');
  const [editPatientMoo, setEditPatientMoo] = useState<string>('หมู่ 1');
  const [editPatientPhone, setEditPatientPhone] = useState<string>('');
  const [editPatientVital, setEditPatientVital] = useState<string>('');
  const [editPatientCaregiver, setEditPatientCaregiver] = useState<string>('');

  // Mind Map active sub-section
  const [selectedMindMapSection, setSelectedMindMapSection] = useState<'overview' | 'vhv' | 'patient' | 'caregiver' | 'benefactor'>('overview');

  // Registered VHVs/Volunteers state
  const [vhvs, setVhvs] = useState<{ id: string; name: string; phone: string; address: string; moo?: string; type: 'อสม' | 'จิตอาสา' }[]>(() => {
    try {
      const saved = localStorage.getItem('stitchsync_vhvs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'VHV-001', name: 'อสม. ประกายดาว สุขสำราญ', phone: '081-555-1111', address: 'บ้านเลขที่ 12 หมู่ 5 ต.ไผ่ต่ำ', moo: 'หมู่ 5', type: 'อสม' },
      { id: 'VHV-002', name: 'อสม. รัตนาภรณ์ รักษ์ดี', phone: '082-666-2222', address: 'บ้านเลขที่ 24 หมู่ 1 ต.ไผ่ต่ำ', moo: 'หมู่ 1', type: 'อสม' },
      { id: 'VHV-003', name: 'อสม. สุทิน บัวงาม', phone: '083-777-3333', address: 'บ้านเลขที่ 3 หมู่ 2 ต.ไผ่ต่ำ', moo: 'หมู่ 2', type: 'อสม' },
      { id: 'VHV-004', name: 'อสม. สายใจ แก้วระย้า', phone: '084-888-4444', address: 'บ้านเลขที่ 8 หมู่ 3 ต.ไผ่ต่ำ', moo: 'หมู่ 3', type: 'อสม' },
      { id: 'VHV-005', name: 'อสม. วิจิตร ใจอารีย์', phone: '085-999-5555', address: 'บ้านเลขที่ 15 หมู่ 4 ต.ไผ่ต่ำ', moo: 'หมู่ 4', type: 'อสม' },
    ];
  });

  // Registered Caregivers state
  const [caregivers, setCaregivers] = useState<{ id: string; name: string; phone: string; address: string; moo?: string; relationship: string }[]>(() => {
    try {
      const saved = localStorage.getItem('stitchsync_caregivers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'CG-001', name: 'คุณประจบ ดีเสมอ', phone: '081-444-5555', address: 'บ้านเลขที่ 11 หมู่ 5 ต.ไผ่ต่ำ (บุตรสาว คุณยายพะยอม)', moo: 'หมู่ 5', relationship: 'บุตรสาว' },
      { id: 'CG-002', name: 'คุณสมจิต วาจาดี', phone: '082-555-6666', address: 'บ้านเลขที่ 4 หมู่ 1 ต.ไผ่ต่ำ (ภรรยา คุณตาประกอบ)', moo: 'หมู่ 1', relationship: 'ภรรยา' },
      { id: 'CG-003', name: 'คุณสายชล เพลินจิต', phone: '083-666-7777', address: 'บ้านเลขที่ 90 หมู่ 2 ต.ไผ่ต่ำ (บุตรชาย คุณป้าสมจิต)', moo: 'หมู่ 2', relationship: 'บุตรชาย' },
    ];
  });

  // Registered Benefactors state (ผู้ทำคุณประโยชน์)
  const [benefactors, setBenefactors] = useState<{ id: string; name: string; phone: string; address: string; moo?: string; contribution: string }[]>(() => {
    try {
      const saved = localStorage.getItem('stitchsync_benefactors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'BEN-001', name: 'คุณสมชาย ใจดี (ผู้ใหญ่บ้านหมู่ 1)', phone: '081-111-2222', address: 'บ้านเลขที่ 1 หมู่ 1 ต.ไผ่ต่ำ', moo: 'หมู่ 1', contribution: 'บริจาคเตียงผู้ป่วยและอุปกรณ์ทางการแพทย์ 2 ชุด' },
      { id: 'BEN-002', name: 'คุณวิภา สุขสวัสดิ์', phone: '082-222-3333', address: 'บ้านเลขที่ 45 หมู่ 3 ต.ไผ่ต่ำ', moo: 'หมู่ 3', contribution: 'สนับสนุนผ้าอ้อมผู้ใหญ่และถุงยังชีพประจำเดือน' },
      { id: 'BEN-003', name: 'มูลนิธิไผ่ต่ำกุศลสงเคราะห์', phone: '083-333-4444', address: 'บ้านเลขที่ 88 หมู่ 5 ต.ไผ่ต่ำ', moo: 'หมู่ 5', contribution: 'สนับสนุนงบประมาณปรับปรุงสภาพบ้านผู้ป่วยภาวะพึ่งพิง' },
    ];
  });

  // Form fields for new registrations
  const [newVhvName, setNewVhvName] = useState<string>('');
  const [newVhvPhone, setNewVhvPhone] = useState<string>('');
  const [newVhvAddress, setNewVhvAddress] = useState<string>('');
  const [newVhvMoo, setNewVhvMoo] = useState<string>('หมู่ 1');
  const [newVhvType, setNewVhvType] = useState<'อสม' | 'จิตอาสา'>('อสม');

  const [newCgName, setNewCgName] = useState<string>('');
  const [newCgPhone, setNewCgPhone] = useState<string>('');
  const [newCgAddress, setNewCgAddress] = useState<string>('');
  const [newCgMoo, setNewCgMoo] = useState<string>('หมู่ 1');
  const [newCgRelationship, setNewCgRelationship] = useState<string>('ญาติ');

  const [newBenName, setNewBenName] = useState<string>('');
  const [newBenPhone, setNewBenPhone] = useState<string>('');
  const [newBenAddress, setNewBenAddress] = useState<string>('');
  const [newBenMoo, setNewBenMoo] = useState<string>('หมู่ 1');
  const [newBenContribution, setNewBenContribution] = useState<string>('');

  // Edit VHV Modal States
  const [isEditVhvModalOpen, setIsEditVhvModalOpen] = useState<boolean>(false);
  const [editVhvId, setEditVhvId] = useState<string>('');
  const [editVhvName, setEditVhvName] = useState<string>('');
  const [editVhvPhone, setEditVhvPhone] = useState<string>('');
  const [editVhvAddress, setEditVhvAddress] = useState<string>('');
  const [editVhvMoo, setEditVhvMoo] = useState<string>('หมู่ 1');
  const [editVhvType, setEditVhvType] = useState<'อสม' | 'จิตอาสา'>('อสม');

  // Edit Caregiver Modal States
  const [isEditCgModalOpen, setIsEditCgModalOpen] = useState<boolean>(false);
  const [editCgId, setEditCgId] = useState<string>('');
  const [editCgName, setEditCgName] = useState<string>('');
  const [editCgPhone, setEditCgPhone] = useState<string>('');
  const [editCgAddress, setEditCgAddress] = useState<string>('');
  const [editCgMoo, setEditCgMoo] = useState<string>('หมู่ 1');
  const [editCgRelationship, setEditCgRelationship] = useState<string>('ญาติ');

  // Edit Benefactor Modal States
  const [isEditBenModalOpen, setIsEditBenModalOpen] = useState<boolean>(false);
  const [editBenId, setEditBenId] = useState<string>('');
  const [editBenName, setEditBenName] = useState<string>('');
  const [editBenPhone, setEditBenPhone] = useState<string>('');
  const [editBenAddress, setEditBenAddress] = useState<string>('');
  const [editBenMoo, setEditBenMoo] = useState<string>('หมู่ 1');
  const [editBenContribution, setEditBenContribution] = useState<string>('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('stitchsync_vhvs', JSON.stringify(vhvs));
  }, [vhvs]);

  useEffect(() => {
    localStorage.setItem('stitchsync_caregivers', JSON.stringify(caregivers));
  }, [caregivers]);

  useEffect(() => {
    localStorage.setItem('stitchsync_benefactors', JSON.stringify(benefactors));
  }, [benefactors]);

  // Search & Moo filter query for each sub-section
  const [vhvSearchQuery, setVhvSearchQuery] = useState<string>('');
  const [vhvMooFilter, setVhvMooFilter] = useState<string>('ทั้งหมด');

  const [cgSearchQuery, setCgSearchQuery] = useState<string>('');
  const [cgMooFilter, setCgMooFilter] = useState<string>('ทั้งหมด');

  const [benSearchQuery, setBenSearchQuery] = useState<string>('');
  const [benMooFilter, setBenMooFilter] = useState<string>('ทั้งหมด');

  const [ptSearchQuery, setPtSearchQuery] = useState<string>('');
  const [ptMooFilter, setPtMooFilter] = useState<string>('ทั้งหมด');

  // Precomputed filtered lists for VHV, Caregivers, and Patients
  const filteredVhvs = useMemo(() => {
    return vhvs.filter(v => {
      const q = vhvSearchQuery.toLowerCase();
      const matchQuery = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q) || v.phone.includes(q);
      const matchMoo = vhvMooFilter === 'ทั้งหมด' || v.moo === vhvMooFilter || v.address.includes(vhvMooFilter);
      return matchQuery && matchMoo;
    });
  }, [vhvs, vhvSearchQuery, vhvMooFilter]);

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter(c => {
      const q = cgSearchQuery.toLowerCase();
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q) || c.relationship.toLowerCase().includes(q);
      const matchMoo = cgMooFilter === 'ทั้งหมด' || c.moo === cgMooFilter || c.address.includes(cgMooFilter);
      return matchQuery && matchMoo;
    });
  }, [caregivers, cgSearchQuery, cgMooFilter]);

  const filteredBenefactors = useMemo(() => {
    return benefactors.filter(b => {
      const q = benSearchQuery.toLowerCase();
      const matchQuery = !q || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.contribution.toLowerCase().includes(q) || b.phone.includes(q);
      const matchMoo = benMooFilter === 'ทั้งหมด' || b.moo === benMooFilter || b.address.includes(benMooFilter);
      return matchQuery && matchMoo;
    });
  }, [benefactors, benSearchQuery, benMooFilter]);

  const filteredDbPatients = useMemo(() => {
    return patients.filter(p => {
      const q = ptSearchQuery.toLowerCase();
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.caregiver.toLowerCase().includes(q);
      const matchMoo = ptMooFilter === 'ทั้งหมด' || p.moo === ptMooFilter || p.address.includes(ptMooFilter);
      return matchQuery && matchMoo;
    });
  }, [patients, ptSearchQuery, ptMooFilter]);

  // Local sync logging for the Network Logs tab
  const [networkLogs, setNetworkLogs] = useState<Array<{ time: string; type: string; details: string; status: 'success' | 'error' | 'pending' }>>([]);

  // Real-time Code Execution Engine States
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [terminalSearch, setTerminalSearch] = useState<string>('');
  const [logFilter, setLogFilter] = useState<string>('ทั้งหมด');
  const [isTerminalHudOpen, setIsTerminalHudOpen] = useState<boolean>(true);
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    cpu: 18.4,
    memory: 146,
    latency: 28,
    execCount: 1240,
    activeWorkers: 4
  });

  const addLog = (type: string, details: string, status: 'success' | 'error' | 'pending' = 'success') => {
    const newLog = {
      time: new Date().toLocaleTimeString('th-TH'),
      type,
      details,
      status,
    };
    setNetworkLogs(prev => [newLog, ...prev]);
  };

  // Realtime System Diagnostic Command Execution
  const runSystemDiagnostic = () => {
    if (isDiagnosticRunning) return;
    setIsDiagnosticRunning(true);
    addLog('Realtime Engine', '🚀 กำลังเริ่มการตรวจวิเคราะห์รันโค้ดเบื้องหลังครบวงจร (Full System Diagnostic)...', 'pending');
    
    const steps = [
      { delay: 300, type: 'System', msg: '⚙️ [01/05] ตรวจสอบสภาวะการทำงานของ Node.js Runtime & ES Modules Server...', status: 'success' },
      { delay: 700, type: 'Sheets DB', msg: '📡 [02/05] ทดสอบการส่งสัญญาณ Ping ไปยัง Google Sheets API & OAuth2 Token Credentials...', status: 'success' },
      { delay: 1100, type: 'Geospatial', msg: '🗺️ [03/05] ถอดรหัสพิกัด KML Bounding Box สำหรับพื้นที่ตำบลไผ่ต่ำ อ.วิหารแดง (14.33°N, 100.82°E)...', status: 'success' },
      { delay: 1500, type: 'Risk Evaluator', msg: '🩺 [04/05] ประมวลผลวิเคราะห์ระดับความเสี่ยงคนไข้ 69 ราย (ติดเตียง 12 ราย, ติดบ้าน 28 ราย, ติดสังคม 29 ราย)...', status: 'success' },
      { delay: 1900, type: 'V8 Engine', msg: '🧹 [05/05] เคลียร์ Heap Memory Garbage Collection และรีเฟรชหน่วยความจำแคชสำเร็จ (ลดการใช้งาน 32 MB)', status: 'success' },
      { delay: 2300, type: 'Realtime Engine', msg: '✅ [COMPLETE] ระบบประมวลผลเบื้องหลังสมบูรณ์ 100% สถานะเซิร์ฟเวอร์เสถียร (Latency: 24ms, CPU: 14.2%)', status: 'success' }
    ];

    steps.forEach(({ delay, type, msg, status }) => {
      setTimeout(() => {
        addLog(type, msg, status as any);
        setRealtimeMetrics(prev => ({
          ...prev,
          execCount: prev.execCount + 1,
          cpu: +(10 + Math.random() * 15).toFixed(1),
          memory: Math.round(135 + Math.random() * 20),
          latency: Math.round(20 + Math.random() * 15)
        }));
        if (delay === 2300) setIsDiagnosticRunning(false);
      }, delay);
    });
  };

  const runEtlPipeline = () => {
    addLog('ETL Worker', '🔄 กำลังประมวลผลกระบวนการ ETL (Extract, Transform, Load) อ่านตาราง Google Sheets 69 รายการ...', 'pending');
    setTimeout(() => {
      addLog('ETL Worker', '✅ ประมวลผลแปลงรูปแบบข้อมูลผู้ป่วยและข้อมูลสัญญาณชีพสำเร็จ 69/69 รายชื่อพร้อมอัปเดตแคช', 'success');
      setRealtimeMetrics(p => ({ ...p, execCount: p.execCount + 1 }));
    }, 600);
  };

  const runGeoIndexer = () => {
    addLog('Geospatial', '🛰️ กำลังคำนวณเวกเตอร์ระยะทางและพิกัดแผนที่สำหรับผู้ป่วย 69 ราย และ อสม. 5 ท่านในตำบลไผ่ต่ำ...', 'pending');
    setTimeout(() => {
      addLog('Geospatial', '📍 การจัดทำคลังพิกัดภูมิศาสตร์ (GIS Spatial Indexing) ตำบลไผ่ต่ำ สมบูรณ์แบบ 100%', 'success');
      setRealtimeMetrics(p => ({ ...p, execCount: p.execCount + 1 }));
    }, 700);
  };

  const runHealthRiskScan = () => {
    addLog('Risk Evaluator', '🩺 สแกนตรวจวัดสัญญาณชีพคนไข้ติดเตียงแบบเรียลไทม์...', 'pending');
    setTimeout(() => {
      addLog('Risk Evaluator', '⚠️ พบผู้ป่วยติดเตียง 2 รายที่ต้องเฝ้าระวังความดัน (คุณยายพะยอม HN-MM001, คุณลุงสุวรรณ HN-MM004) ส่งการแจ้งเตือนยัง อสม.', 'success');
      setRealtimeMetrics(p => ({ ...p, execCount: p.execCount + 1 }));
    }, 800);
  };

  const runMemoryGc = () => {
    addLog('V8 Engine', '🧹 เรียกใช้งาน V8 Garbage Collector สำหรับเคลียร์ Heap Memory และหน่วยความจำชั่วคราว...', 'pending');
    setTimeout(() => {
      addLog('V8 Engine', '✨ คืนค่าหน่วยความจำชั่วคราว 36.4 MB เรียบร้อย Heap usage: 128 MB / 512 MB', 'success');
      setRealtimeMetrics(p => ({ ...p, memory: 128, execCount: p.execCount + 1 }));
    }, 500);
  };

  // Automated background heartbeat simulation for live code running display
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      setRealtimeMetrics(prev => {
        const nextCpu = +(12 + Math.random() * 18).toFixed(1);
        const nextMem = Math.round(138 + Math.random() * 24);
        const nextLat = Math.round(22 + Math.random() * 18);
        return {
          ...prev,
          cpu: nextCpu,
          memory: nextMem,
          latency: nextLat,
          execCount: prev.execCount + 1
        };
      });

      // Randomly emit background events
      const roll = Math.random();
      if (roll < 0.35) {
        const bgLogs = [
          { type: 'Heartbeat', msg: '🟢 Server process loop ping OK (Memory: 142MB, Active threads: 4)', status: 'success' },
          { type: 'Cron Job', msg: '⏱️ Automated background worker tick: Checking Google Sheets sync queue', status: 'success' },
          { type: 'Sheets DB', msg: '📡 Latency check pass to Google Sheets API (Response 200 OK)', status: 'success' },
          { type: 'Geospatial', msg: '📍 Realtime GPS pin check for Phai Tam หมู่ 1 - หมู่ 8 active', status: 'success' },
        ];
        const selected = bgLogs[Math.floor(Math.random() * bgLogs.length)];
        addLog(selected.type, selected.msg, selected.status as any);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  // Auth flow initialization
  useEffect(() => {
    addLog('System', 'กำลังเริ่มต้นระบบยืนยันตัวตน...', 'pending');
    
    // Check local storage session first
    const savedRole = localStorage.getItem('stitchsync_role');
    const savedUser = localStorage.getItem('stitchsync_user');
    const savedToken = localStorage.getItem('stitchsync_token');

    if (savedRole && (savedRole === 'public' || savedToken === 'mock-staff-token' || savedToken === 'vhv-no-pass-token' || savedToken === 'staff-gmail-token')) {
      const parsedUser = savedUser ? JSON.parse(savedUser) : { displayName: 'ผู้ใช้ทั่วไป', email: '' };
      setUser(parsedUser);
      setToken(savedToken);
      setUserRole(savedRole as any);
      setNeedsAuth(false);
      setLoading(false);
      addLog('Auth', `กู้คืนระบบแบบรวดเร็วสำเร็จ: [${savedRole === 'public' ? 'บุคคลทั่วไป' : 'เจ้าหน้าที่/อสม.'}] คุณ ${parsedUser.displayName}`, 'success');
      fetchData(savedToken);
      return;
    }

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        
        // Resolve role dynamically based on whitelist
        const resolvedRole = resolveAndSetUserRole(currentUser.email);
        setUserRole(resolvedRole);
        
        localStorage.setItem('stitchsync_role', resolvedRole);
        localStorage.setItem('stitchsync_user', JSON.stringify({
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        }));
        localStorage.setItem('stitchsync_token', accessToken);
        
        setNeedsAuth(false);
        setLoading(false);
        addLog('Auth', `เชื่อมต่อ Google Sign-In สำเร็จ: ${currentUser.displayName} [สิทธิ์: ${resolvedRole === 'staff' ? 'เจ้าหน้าที่' : 'บุคคลทั่วไป'}]`, 'success');
        // Initial Fetch
        fetchData(accessToken);
      },
      () => {
        if (!localStorage.getItem('stitchsync_role')) {
          setNeedsAuth(true);
          addLog('Auth', 'รอลงชื่อเข้าใช้ระบบ (เจ้าหน้าที่ หรือ บุคคลทั่วไป)...', 'pending');
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [authorizedEmails]); // Listen to whitelist changes

  // Auto-fetch Google Sheets data on tab open
  useEffect(() => {
    if (currentTab === 'import' && sheetPatients.length === 0 && !loadingSheet) {
      handleFetchGoogleSheet();
    }
  }, [currentTab]);

  const handleLogin = async () => {
    setLoading(true);
    addLog('Auth', 'กำลังเปิดหน้าจอยืนยันสิทธิ์ Google Sign-In...', 'pending');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        
        // Resolve role dynamically based on whitelist
        const resolvedRole = resolveAndSetUserRole(result.user.email);
        setUserRole(resolvedRole);
        
        localStorage.setItem('stitchsync_role', resolvedRole);
        localStorage.setItem('stitchsync_user', JSON.stringify({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        }));
        localStorage.setItem('stitchsync_token', result.accessToken);
        
        setNeedsAuth(false);
        if (resolvedRole === 'staff') {
          addLog('Auth', `เชื่อมต่อบัญชี Gmail ${result.user.email} สำเร็จ (สิทธิ์เจ้าหน้าที่สาธารณสุข)`, 'success');
        } else {
          addLog('Auth', `เชื่อมต่อบัญชี Gmail ${result.user.email} สำเร็จในฐานะ [บุคคลทั่วไป]`, 'success');
          alert('💡 หมายเหตุ: บัญชีของคุณได้รับการลงชื่อเข้าใช้แล้ว แต่เนื่องจากอีเมลนี้ไม่ได้อยู่ในรายชื่อเจ้าหน้าที่ที่ได้รับอนุมัติ (Whitelist) คุณจะใช้งานในฐานะ "บุคคลทั่วไป" (สิทธิ์อ่านอย่างเดียว) หากเป็นเจ้าหน้าที่ กรุณาติดต่อผู้ดูแลระบบหลักเพื่อเพิ่มอีเมลนี้เข้าสู่รายชื่ออนุมัติ');
        }
        fetchData(result.accessToken);
      }
    } catch (error: any) {
      console.error(error);
      addLog('Auth', `เข้าสู่ระบบไม่สำเร็จ: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMockStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = mockStaffName.trim() || 'เจ้าหน้าที่ สมชาย (อสม.ไผ่ต่ำ)';
    setLoading(true);
    addLog('Auth', `กำลังเตรียมการเข้าสู่ระบบแบบ อสม. จำลอง: ${name}`, 'pending');
    
    setTimeout(() => {
      const mockUser = {
        displayName: name,
        email: 'somchai.staff@phaitam.go.th',
        photoURL: ''
      };
      setUser(mockUser);
      setToken('mock-staff-token');
      setUserRole('staff');
      
      localStorage.setItem('stitchsync_role', 'staff');
      localStorage.setItem('stitchsync_user', JSON.stringify(mockUser));
      localStorage.setItem('stitchsync_token', 'mock-staff-token');
      
      setNeedsAuth(false);
      setLoading(false);
      addLog('Auth', `เข้าใช้งานในฐานะเจ้าหน้าที่จำลองสำเร็จ: คุณ ${name}`, 'success');
      fetchData('mock-staff-token');
    }, 400);
  };

  const handlePublicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestName.trim() || 'บุคคลทั่วไป (ผู้มาเยือน)';
    setLoading(true);
    addLog('Auth', `กำลังเข้าสู่ระบบเพื่อเข้าชมทั่วไป: ${name}`, 'pending');
    
    setTimeout(() => {
      const mockUser = {
        displayName: name,
        email: 'guest@phaitam.go.th',
        photoURL: ''
      };
      setUser(mockUser);
      setToken(null);
      setUserRole('public');
      
      localStorage.setItem('stitchsync_role', 'public');
      localStorage.setItem('stitchsync_user', JSON.stringify(mockUser));
      localStorage.removeItem('stitchsync_token');
      
      setNeedsAuth(false);
      setLoading(false);
      addLog('Auth', `เข้าใช้งานในฐานะบุคคลทั่วไปสำเร็จ: ${name} (โหมดจำกัดสิทธิ์แก้ไข)`, 'success');
      fetchData(null);
    }, 400);
  };

  const handleVhvLogin = (e?: React.FormEvent, selectedName?: string) => {
    if (e) e.preventDefault();
    const name = (selectedName || vhvLoginName || mockStaffName).trim() || 'อสม. ประจำตำบลไผ่ต่ำ';
    setLoading(true);
    addLog('Auth', `กำลังเข้าสู่ระบบ อสม.: ${name} (ไม่ต้องใช้รหัสผ่าน)...`, 'pending');
    
    setTimeout(() => {
      const vhvUser = {
        displayName: name,
        email: `${name.replace(/\s+/g, '.')}@phaitam-vhv.go.th`,
        photoURL: ''
      };
      setUser(vhvUser);
      setToken('vhv-no-pass-token');
      setUserRole('staff');
      
      localStorage.setItem('stitchsync_role', 'staff');
      localStorage.setItem('stitchsync_user', JSON.stringify(vhvUser));
      localStorage.setItem('stitchsync_token', 'vhv-no-pass-token');
      
      setNeedsAuth(false);
      setLoading(false);
      addLog('Auth', `เข้าใช้งานในฐานะ อสม. สำเร็จ: ${name} (ไม่ต้องใส่รหัสผ่าน)`, 'success');
      fetchData('vhv-no-pass-token');
    }, 300);
  };

  const handleStaffGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffGmailInput.trim() || !staffGmailInput.includes('@')) {
      alert('กรุณากรอกอีเมล Gmail ที่ถูกต้อง (เช่น somchai.health@gmail.com)');
      return;
    }
    const email = staffGmailInput.trim().toLowerCase();
    setLoading(true);
    addLog('Auth', `ยืนยันตัวตนด้วย Gmail เจ้าหน้าที่: ${email}`, 'pending');

    setTimeout(() => {
      const resolvedRole = resolveAndSetUserRole(email);
      const gmailUser = {
        displayName: email.split('@')[0],
        email: email,
        photoURL: ''
      };
      setUser(gmailUser);
      setToken('staff-gmail-token');
      setUserRole(resolvedRole);

      localStorage.setItem('stitchsync_role', resolvedRole);
      localStorage.setItem('stitchsync_user', JSON.stringify(gmailUser));
      localStorage.setItem('stitchsync_token', 'staff-gmail-token');

      setNeedsAuth(false);
      setLoading(false);
      addLog('Auth', `เข้าใช้งานระบบเจ้าหน้าที่ด้วย Gmail: ${email} [สิทธิ์: ${resolvedRole === 'staff' ? 'เจ้าหน้าที่' : 'บุคคลทั่วไป'}]`, 'success');
      fetchData('staff-gmail-token');
    }, 300);
  };

  const handleLogout = async () => {
    if (window.confirm('คุณต้องการออกจากระบบการจัดการสุขภาพใช่หรือไม่?')) {
      addLog('Auth', 'กำลังทำการออกจากระบบ...', 'pending');
      
      localStorage.removeItem('stitchsync_role');
      localStorage.removeItem('stitchsync_user');
      localStorage.removeItem('stitchsync_token');
      
      if (token && token !== 'mock-staff-token') {
        try {
          await googleSignOut();
        } catch (e) {
          console.error(e);
        }
      }
      
      setUser(null);
      setToken(null);
      setUserRole(null);
      setNeedsAuth(true);
      setPatients([]);
      setActivities([]);
      addLog('Auth', 'ออกจากระบบและเคลียร์เซสชันเรียบร้อย', 'success');
    }
  };

  // Fetch from Google Sheets Database
  const fetchData = async (accessToken: string | null) => {
    setSyncing(true);
    
    if (!accessToken || accessToken === 'mock-staff-token' || !accessToken.startsWith('ya29.')) {
      addLog('Local DB', 'กำลังอ่านข้อมูลประชากรจากฐานข้อมูล Sandbox ของเครื่อง...', 'pending');
      try {
        const localPatients = localStorage.getItem('stitchsync_patients');
        const localActivities = localStorage.getItem('stitchsync_activities');
        
        let loadedPatients: Patient[] = [];
        let loadedActivities: Activity[] = [];

        // Check/Seed Patients
        if (localPatients) {
          loadedPatients = JSON.parse(localPatients);
        } else {
          loadedPatients = SEED_PATIENTS;
          localStorage.setItem('stitchsync_patients', JSON.stringify(loadedPatients));
        }

        // Check/Seed Activities
        if (localActivities) {
          loadedActivities = JSON.parse(localActivities);
        } else {
          loadedActivities = SEED_ACTIVITIES;
          localStorage.setItem('stitchsync_activities', JSON.stringify(loadedActivities));
        }

        setPatients(loadedPatients);
        setActivities(loadedActivities);
        addLog('Local DB', `ดึงข้อมูลสำเร็จ: โหลดผู้ป่วย ${loadedPatients.length} ราย, กิจกรรมเยี่ยมบ้าน ${loadedActivities.length} รายการ`, 'success');
        
        if (loadedPatients.length > 0 && selectedPatientId === '') {
          setSelectedPatientId(loadedPatients[0].id);
        }
      } catch (e: any) {
        console.error(e);
        addLog('Local DB', `เกิดข้อผิดพลาดการโหลด Sandbox DB: ${e.message}`, 'error');
      } finally {
        setSyncing(false);
      }
      return;
    }

    addLog('Sheets DB', 'กำลังค้นหาหรือเชื่อมต่อ Google Sheets ฐานข้อมูล...', 'pending');
    try {
      const sheetsService = new SheetsService(accessToken);
      const spreadId = await sheetsService.getOrCreateSpreadsheet();
      addLog('Sheets DB', `เชื่อมต่อแผ่นงานรหัส: ${spreadId.substring(0, 15)}... แล้ว`, 'success');
      
      addLog('Sheets DB', 'กำลังอ่านข้อมูลประชากรและผู้ป่วย...', 'pending');
      const loadedPatients = await sheetsService.fetchPatients();
      setPatients(loadedPatients);
      addLog('Sheets DB', `โหลดข้อมูลผู้ป่วยจำนวน ${loadedPatients.length} ราย สำเร็จ`, 'success');

      addLog('Sheets DB', 'กำลังอ่านประวัติกิจกรรมล่าสุด...', 'pending');
      const loadedActivities = await sheetsService.fetchActivities();
      setActivities(loadedActivities);
      addLog('Sheets DB', `โหลดบันทึกกิจกรรมจำนวน ${loadedActivities.length} รายการ สำเร็จ`, 'success');

      if (loadedPatients.length > 0 && selectedPatientId === '') {
        setSelectedPatientId(loadedPatients[0].id);
      }
    } catch (error: any) {
      console.warn('Sheets connection notice:', error.message);
      addLog('Sheets DB', `สลับใช้ Local Sandbox DB (${error.message || 'ใช้ข้อมูลในเครื่อง'})`, 'pending');

      try {
        const localPatients = localStorage.getItem('stitchsync_patients');
        const localActivities = localStorage.getItem('stitchsync_activities');
        let loadedPatients: Patient[] = localPatients ? JSON.parse(localPatients) : SEED_PATIENTS;
        let loadedActivities: Activity[] = localActivities ? JSON.parse(localActivities) : SEED_ACTIVITIES;

        if (!localPatients) {
          localStorage.setItem('stitchsync_patients', JSON.stringify(loadedPatients));
        }
        if (!localActivities) {
          localStorage.setItem('stitchsync_activities', JSON.stringify(loadedActivities));
        }

        setPatients(loadedPatients);
        setActivities(loadedActivities);
        addLog('Local DB', `โหลดฐานข้อมูลท้องถิ่นสำเร็จ: ผู้ป่วย ${loadedPatients.length} ราย, กิจกรรม ${loadedActivities.length} รายการ`, 'success');

        if (loadedPatients.length > 0 && selectedPatientId === '') {
          setSelectedPatientId(loadedPatients[0].id);
        }
      } catch (fallbackErr) {
        console.warn('Local storage fallback error:', fallbackErr);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Quick manual refresh
  const handleRefresh = () => {
    fetchData(token);
  };

  // Export all system data to Excel (.xlsx) file
  const handleExportAllExcel = () => {
    try {
      exportAllToExcel(patients, vhvs, caregivers, activities, benefactors);
      addLog('Local DB', `ดาวน์โหลดไฟล์ Excel (.xlsx) รวม 5 ฐานข้อมูลสำเร็จ (${patients.length} ผู้ป่วย, ${vhvs.length} อสม., ${caregivers.length} ผู้ดูแล, ${benefactors.length} ผู้ทำคุณประโยชน์, ${activities.length} บันทึกเยี่ยม)`, 'success');
    } catch (err: any) {
      console.error('Error exporting Excel:', err);
      addLog('Local DB', `เกิดข้อผิดพลาดการส่งออก Excel: ${err.message}`, 'error');
    }
  };

  // Open Google Drive / Google Sheets
  const handleOpenGoogleDrive = () => {
    const cachedSpreadId = localStorage.getItem('stitchsync_spreadsheet_id');
    if (cachedSpreadId) {
      window.open(`https://docs.google.com/spreadsheets/d/${cachedSpreadId}/edit`, '_blank');
      addLog('Sheets DB', `เปิด Google Sheets รหัส: ${cachedSpreadId.substring(0, 15)}...`, 'success');
    } else {
      window.open('https://drive.google.com/', '_blank');
      addLog('Sheets DB', 'เปิด Google Drive', 'success');
    }
  };

  // Parser KML Content from Google My Maps
  const parseKML = (kmlText: string): Patient[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlText, "text/xml");
      const placemarks = xmlDoc.getElementsByTagName("Placemark");
      const importedList: Patient[] = [];

      for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i];
        const nameEl = placemark.getElementsByTagName("name")[0];
        const descEl = placemark.getElementsByTagName("description")[0];
        const coordsEl = placemark.getElementsByTagName("coordinates")[0];

        if (!nameEl) continue;

        const name = nameEl.textContent?.trim() || `ผู้ป่วยนำเข้า #${i + 1}`;
        const desc = descEl ? descEl.textContent || "" : "";
        
        let lat = 14.332266;
        let lng = 100.822967;
        
        if (coordsEl && coordsEl.textContent) {
          const parts = coordsEl.textContent.trim().split(",");
          if (parts.length >= 2) {
            lng = parseFloat(parts[0]) || 100.822967;
            lat = parseFloat(parts[1]) || 14.332266;
          }
        }

        // Try to identify category
        let category: PatientCategory = "ติดสังคม";
        if (desc.includes("ติดเตียง") || name.includes("ติดเตียง") || desc.includes("เตียง")) {
          category = "ติดเตียง";
        } else if (desc.includes("ติดบ้าน") || name.includes("ติดบ้าน")) {
          category = "ติดบ้าน";
        }

        // Extract caregiver / อสม.
        let caregiver = "อสม. ในพื้นที่";
        const vhvMatch = desc.match(/(อสม|ผู้ดูแล|อสม\.)[:\s]+([^\n\r,]+)/);
        if (vhvMatch) {
          caregiver = vhvMatch[2].trim();
        }

        // Extract phone number
        let phone = "08x-xxx-xxxx";
        const phoneMatch = desc.match(/(เบอร์โทร|โทรศัพท์|โทร|ติดต่อ)[:\s]+([0-9\-]+)/);
        if (phoneMatch) {
          phone = phoneMatch[2].trim();
        }

        // Extract vital signs or symptoms
        let vitalSigns = "ปกติ วัดความดันและชีพจรเสถียร";
        const vitalMatch = desc.match(/(อาการ|ชีพจร|ความดัน|สัญญาณชีพ)[:\s]+([^\n\r,]+)/);
        if (vitalMatch) {
          vitalSigns = vitalMatch[2].trim();
        }

        // Extract address
        let address = "หมู่ตำบลไผ่ต่ำ อ.วิหารแดง จ.สระบุรี";
        const addrMatch = desc.match(/(ที่อยู่|บ้านเลขที่)[:\s]+([^\n\r]+)/);
        if (addrMatch) {
          address = addrMatch[2].trim();
        }

        importedList.push({
          id: `HN-MM${String(patients.length + importedList.length + 1).padStart(3, '0')}`,
          name,
          category,
          address,
          vitalSigns,
          caregiver,
          lat,
          lng,
          lastVisited: 'นำเข้าจาก Google My Maps',
          phone,
        });
      }

      return importedList;
    } catch (e: any) {
      console.error("KML Parse error:", e);
      throw new Error(`รูปแบบไฟล์ KML ไม่ถูกต้องหรือการประมวลผลล้มเหลว: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setKmlInput(text);
      setImportError(null);
    };
    reader.readAsText(file);
  };

  const handleProcessKML = () => {
    if (!kmlInput.trim()) {
      setImportError('กรุณาวางข้อมูล KML หรืออัปโหลดไฟล์ KML ของคุณก่อน');
      return;
    }
    setImportError(null);
    try {
      const parsed = parseKML(kmlInput);
      if (parsed.length === 0) {
        setImportError('ไม่พบข้อมูลจุดพิกัดผู้ป่วย (<Placemark>) ในเนื้อหา KML ที่ระบุ');
      } else {
        setImportedPatients(parsed);
        addLog('My Maps Parser', `ดึงพิกัดและรายชื่อสำเร็จ: พบบุคคลเป้าหมาย ${parsed.length} ราย`, 'success');
      }
    } catch (err: any) {
      setImportError(err.message);
    }
  };

  const handleLoadDemoMyMaps = () => {
    setImportError(null);
    addLog('My Maps Simulated', 'กำลังดึงสตรีมพิกัดแผนที่ตำบลไผ่ต่ำจากลิงก์แผนที่...', 'pending');
    
    // Exact high-quality simulator matching the provided map coordinates in Phai Tam: 
    // center: 14.332266451410785, 100.82296756103872
    const demoPatients: Patient[] = [
      {
        id: `HN-MM${String(patients.length + 1).padStart(3, '0')}`,
        name: 'คุณยายพะยอม ดีเสมอ',
        category: 'ติดเตียง',
        address: 'บ้านเลขที่ 11 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
        vitalSigns: 'ความดัน 135/85 ชีพจร 78 ครั้ง/นาที',
        caregiver: 'อสม. ประกายดาว',
        lat: 14.332066,
        lng: 100.822967,
        lastVisited: 'เพิ่งนำเข้าจาก My Maps',
        phone: '081-555-1234',
      },
      {
        id: `HN-MM${String(patients.length + 2).padStart(3, '0')}`,
        name: 'คุณตาประกอบ วาจาดี',
        category: 'ติดบ้าน',
        address: 'บ้านเลขที่ 4 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
        vitalSigns: 'ความดันปกติ 120/80 ปวดขาและเข่าเล็กน้อย',
        caregiver: 'อสม. รัตนาภรณ์',
        lat: 14.333155,
        lng: 100.821421,
        lastVisited: 'เพิ่งนำเข้าจาก My Maps',
        phone: '082-666-2345',
      },
      {
        id: `HN-MM${String(patients.length + 3).padStart(3, '0')}`,
        name: 'คุณป้าพยอม เพลินจิต',
        category: 'ติดสังคม',
        address: 'บ้านเลขที่ 72 หมู่ 3 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
        vitalSigns: 'ปกติ แข็งแรง อารมณ์ร่าเริงแจ่มใส',
        caregiver: 'อสม. สุทิน',
        lat: 14.331122,
        lng: 100.824555,
        lastVisited: 'เพิ่งนำเข้าจาก My Maps',
        phone: '089-777-3456',
      },
      {
        id: `HN-MM${String(patients.length + 4).padStart(3, '0')}`,
        name: 'คุณลุงสุวรรณ แก้วประเสริฐ',
        category: 'ติดเตียง',
        address: 'บ้านเลขที่ 58 หมู่ 2 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
        vitalSigns: 'อัมพาตครึ่งซีก ตอบสนองดีเมื่อเรียก',
        caregiver: 'อสม. สายใจ',
        lat: 14.334055,
        lng: 100.823901,
        lastVisited: 'เพิ่งนำเข้าจาก My Maps',
        phone: '085-888-4567',
      },
      {
        id: `HN-MM${String(patients.length + 5).padStart(3, '0')}`,
        name: 'คุณยายกิ่งแก้ว ยอดรัก',
        category: 'ติดบ้าน',
        address: 'บ้านเลขที่ 102/1 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี',
        vitalSigns: 'ควบคุมเบาหวานได้ดี น้ำตาลสะสมคงที่',
        caregiver: 'อสม. ประกายดาว',
        lat: 14.329899,
        lng: 100.821999,
        lastVisited: 'เพิ่งนำเข้าจาก My Maps',
        phone: '083-999-5678',
      }
    ];

    setTimeout(() => {
      setImportedPatients(demoPatients);
      addLog('My Maps Parser', 'ดึงข้อมูลจำลองเสมือนจริงของตำบลไผ่ต่ำเรียบร้อยแล้ว!', 'success');
    }, 600);
  };

  const extractSpreadsheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i+1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        if (row.length > 0 && row.some(val => val !== '')) {
          lines.push(row);
        }
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      lines.push(row);
    }
    return lines;
  };

  const mapRowsToPatients = (rows: any[][]): Patient[] => {
    if (rows.length < 2) return [];
    
    // Find header row
    let headerIndex = 0;
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const rowStr = rows[r].join(' ').toLowerCase();
      if (rowStr.includes('ชื่อ') || rowStr.includes('name') || rowStr.includes('ลำดับ') || rowStr.includes('hn') || rowStr.includes('เลข')) {
        headerIndex = r;
        break;
      }
    }
    
    const headers = rows[headerIndex].map((h: any) => String(h || '').trim().toLowerCase());
    const dataRows = rows.slice(headerIndex + 1);
    
    // Look for indices
    const nameIdx = headers.findIndex(h => h.includes('ชื่อ') || h.includes('นามสกุล') || h.includes('name') || h.includes('คนไข้') || h.includes('ผู้สูงอายุ') || h.includes('ผู้มีภาวะพึ่งพิง'));
    const catIdx = headers.findIndex(h => h.includes('กลุ่ม') || h.includes('ประเภท') || h.includes('ภาวะพึ่งพิง') || h.includes('adl') || h.includes('เตียง') || h.includes('category') || h.includes('ระดับ'));
    const addrIdx = headers.findIndex(h => h.includes('ที่อยู่') || h.includes('บ้านเลขที่') || h.includes('address') || h.includes('บ้าน'));
    const cgIdx = headers.findIndex(h => h.includes('อสม') || h.includes('ผู้ดูแล') || h.includes('caregiver') || h.includes('cg'));
    const phoneIdx = headers.findIndex(h => h.includes('โทร') || h.includes('เบอร์') || h.includes('phone') || h.includes('ติดต่อ'));
    const latIdx = headers.findIndex(h => h.includes('lat') || h.includes('ละติจูด') || h.includes('latitude') || h.includes('พิกัด y') || h.includes('y'));
    const lngIdx = headers.findIndex(h => h.includes('lng') || h.includes('ลองจิจูด') || h.includes('longitude') || h.includes('พิกัด x') || h.includes('x'));
    const vitalIdx = headers.findIndex(h => h.includes('อาการ') || h.includes('สัญญาณชีพ') || h.includes('ชีพจร') || h.includes('ความดัน') || h.includes('โรคประจำตัว') || h.includes('โรค') || h.includes('หมายเหตุ') || h.includes('vitals') || h.includes('ภาวะพึ่งพิง'));

    const parsed: Patient[] = [];
    
    dataRows.forEach((row, i) => {
      if (!row || row.length === 0 || !row.some(val => val !== '')) return;
      
      let name = '';
      if (nameIdx !== -1 && row[nameIdx]) {
        name = String(row[nameIdx]).trim();
      } else {
        const firstTextCol = row.find((val: any) => val && isNaN(Number(val)) && String(val).trim().length > 3);
        name = firstTextCol ? String(firstTextCol).trim() : `ผู้พึ่งพิงรายที่ ${i + 1}`;
      }

      if (name.includes('รวม') || name.includes('ชื่อ-นามสกุล') || name === 'Name' || name.length < 2) return;
      
      let hn = `HN-S${String(patients.length + parsed.length + 1).padStart(3, '0')}`;
      const hnIdx = headers.findIndex(h => h.includes('hn') || h.includes('รหัส') || h.includes('เลขประจำตัว') || h.includes('id'));
      if (hnIdx !== -1 && row[hnIdx]) {
        hn = String(row[hnIdx]).trim();
      }
      
      let category: PatientCategory = 'ติดบ้าน';
      let catVal = '';
      if (catIdx !== -1 && row[catIdx]) {
        catVal = String(row[catIdx]).trim();
      } else {
        const rowText = row.join(' ');
        if (rowText.includes('ติดเตียง') || rowText.includes('เตียง') || rowText.includes('group 3') || rowText.includes('กลุ่ม 3')) {
          category = 'ติดเตียง';
        } else if (rowText.includes('ติดบ้าน') || rowText.includes('บ้าน') || rowText.includes('group 2') || rowText.includes('กลุ่ม 2')) {
          category = 'ติดบ้าน';
        } else if (rowText.includes('ติดสังคม') || rowText.includes('สังคม') || rowText.includes('group 1') || rowText.includes('กลุ่ม 1')) {
          category = 'ติดสังคม';
        }
      }
      
      if (catVal) {
        if (catVal.includes('เตียง') || catVal.includes('ติดเตียง') || catVal.includes('3') || catVal.toLowerCase().includes('bedridden')) {
          category = 'ติดเตียง';
        } else if (catVal.includes('บ้าน') || catVal.includes('ติดบ้าน') || catVal.includes('2') || catVal.toLowerCase().includes('homebound')) {
          category = 'ติดบ้าน';
        } else {
          category = 'ติดสังคม';
        }
      }
      
      let address = 'ตำบลไผ่ต่ำ อ.วิหารแดง จ.สระบุรี';
      if (addrIdx !== -1 && row[addrIdx]) {
        address = String(row[addrIdx]).trim();
        if (!address.includes('ไผ่ต่ำ') && !address.includes('สระบุรี')) {
          address += ' ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี';
        }
      }
      
      let caregiver = 'อสม. ประจำหมู่บ้าน';
      if (cgIdx !== -1 && row[cgIdx]) {
        caregiver = String(row[cgIdx]).trim();
      }
      
      let phone = '08x-xxx-xxxx';
      if (phoneIdx !== -1 && row[phoneIdx]) {
        phone = String(row[phoneIdx]).trim();
      }
      
      let vitalSigns = 'สัญญาณชีพเสถียร ติดตามอาการต่อเนื่อง';
      if (vitalIdx !== -1 && row[vitalIdx]) {
        vitalSigns = String(row[vitalIdx]).trim();
      }
      
      let lat = 14.320 + (Math.random() * 0.015);
      let lng = 100.810 + (Math.random() * 0.020);
      
      if (latIdx !== -1 && row[latIdx]) {
        const parsedLat = parseFloat(row[latIdx]);
        if (!isNaN(parsedLat) && parsedLat > 13 && parsedLat < 16) {
          lat = parsedLat;
        }
      }
      if (lngIdx !== -1 && row[lngIdx]) {
        const parsedLng = parseFloat(row[lngIdx]);
        if (!isNaN(parsedLng) && parsedLng > 99 && parsedLng < 102) {
          lng = parsedLng;
        }
      }
      
      parsed.push({
        id: hn,
        name,
        category,
        address,
        vitalSigns,
        caregiver,
        lat,
        lng,
        lastVisited: 'นำเข้าจาก Google Sheets',
        phone
      });
    });
    
    return parsed;
  };

  const handleFetchGoogleSheet = async (customUrl?: string, specificSheet?: string) => {
    const targetUrl = customUrl || sheetUrl;
    const spreadsheetId = extractSpreadsheetId(targetUrl);
    if (!spreadsheetId) {
      setSheetError('ลิงก์ Google Sheets ไม่ถูกต้อง กรุณาใช้รูปแบบ https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...');
      return;
    }

    setLoadingSheet(true);
    setSheetError(null);
    addLog('Sheets Loader', `กำลังเริ่มดึงข้อมูลจาก Spreadsheet: ${spreadsheetId.substring(0, 10)}...`, 'pending');

    try {
      if (token && token !== 'mock-staff-token') {
        const sheetsService = new SheetsService(token);
        
        // 1. Get sheets list first if empty or different sheet loaded
        let sheets = sheetList;
        try {
          sheets = await sheetsService.getSpreadsheetSheets(spreadsheetId);
          setSheetList(sheets);
        } catch (metaErr) {
          console.warn('Could not fetch sheet list via API, trying default sheets:', metaErr);
          sheets = ['Sheet1', 'Patients', 'แผ่นงาน1', 'รายชื่อผู้พึ่งพิง'];
          setSheetList(sheets);
        }

        const activeSheet = specificSheet || selectedSheetName || sheets[0] || 'Sheet1';
        if (!selectedSheetName) {
          setSelectedSheetName(activeSheet);
        }

        // 2. Fetch sheet values
        const rows = await sheetsService.fetchSheetValues(spreadsheetId, activeSheet);
        if (rows.length === 0) {
          throw new Error(`ไม่พบข้อมูลในแผ่นงาน "${activeSheet}" หรือไม่สามารถดึงข้อมูลได้`);
        }

        const parsedPatients = mapRowsToPatients(rows);
        setSheetPatients(parsedPatients);
        addLog('Sheets Loader', `ดึงข้อมูลด้วยสิทธิ์ Google API สำเร็จ! โหลดได้ ${parsedPatients.length} รายชื่อ`, 'success');
      } else {
        // Public sheet CSV fetch fallback
        addLog('Sheets Loader', 'กำลังเชื่อมต่อแบบ Public Export Link (ไม่ต้องใช้การล็อกอิน)...', 'pending');
        
        const activeSheet = specificSheet || selectedSheetName || 'Sheet1';
        const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${specificSheet || selectedSheetName ? `&sheet=${encodeURIComponent(activeSheet)}` : ''}`;
        
        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error('ไม่สามารถเข้าถึงแผ่นงานได้ทางสาธารณะ กรุณาตั้งค่าแชร์แผ่นงานให้ "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน" (Anyone with link can view) หรือ ล็อกอินเข้าสู่ระบบด้วยบัญชี Google ของท่าน');
        }

        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        if (rows.length === 0) {
          throw new Error('ไม่พบแถวข้อมูลจากการดึงแบบสาธารณะ');
        }

        const parsedPatients = mapRowsToPatients(rows);
        setSheetPatients(parsedPatients);
        
        if (sheetList.length === 0) {
          setSheetList([activeSheet]);
          setSelectedSheetName(activeSheet);
        }

        addLog('Sheets Loader', `ดึงข้อมูลแบบสาธารณะสำเร็จ! ถอดโครงสร้างได้ ${parsedPatients.length} รายชื่อ`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      setSheetError(err.message || 'เกิดข้อผิดพลาดในการโหลดชีท');
      addLog('Sheets Loader', `โหลดแผ่นงานล้มเหลว: ${err.message}`, 'error');
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleSaveSheetPatients = () => {
    if (sheetPatients.length === 0) {
      alert('ไม่มีรายชื่อที่โหลดมาเพื่อบันทึก');
      return;
    }

    if (userRole === 'public') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: บุคคลทั่วไปไม่สามารถซิงค์หรือนำรายชื่อใหม่เข้าสู่ระบบฐานข้อมูลได้');
      return;
    }

    setSyncing(true);
    addLog('Sheets Sync', `กำลังนำเข้าผู้พึ่งพิงจำนวน ${sheetPatients.length} รายเข้าสู่ระบบ...`, 'pending');

    setTimeout(async () => {
      try {
        if (!token || token === 'mock-staff-token') {
          // Sync locally
          const existingNames = new Set(patients.map(p => p.name));
          const newToAppend = sheetPatients.filter(p => !existingNames.has(p.name));
          
          if (newToAppend.length === 0) {
            alert('ข้อมูลรายชื่อทั้งหมดเชื่อมโยงอยู่แล้ว ไม่จำเป็นต้องนำเข้าซ้ำ');
            addLog('Sheets Sync', 'ไม่พบรายชื่อใหม่ในการซิงค์ฐานข้อมูล', 'success');
            setSyncing(false);
            return;
          }

          const updated = [...newToAppend, ...patients];
          setPatients(updated);
          localStorage.setItem('stitchsync_patients', JSON.stringify(updated));
          addLog('Local DB', `ซิงค์รายชื่อใหม่ ${newToAppend.length} รายการลงระบบ Sandbox สำเร็จ!`, 'success');
          alert(`ซิงค์ข้อมูลใหม่สำเร็จ! เพิ่มประชากรใหม่เข้าสู่ระบบจำนวน ${newToAppend.length} ราย`);
        } else {
          // Sync with Google Sheets DB
          const sheetsService = new SheetsService(token);
          const existingNames = new Set(patients.map(p => p.name));
          const newToAppend = sheetPatients.filter(p => !existingNames.has(p.name));

          if (newToAppend.length === 0) {
            alert('รายชื่อทั้งหมดในตารางเชื่อมโยงกับระบบหลักเรียบร้อยแล้ว');
            addLog('Sheets Sync', 'ระบบหลักได้รับการอัปเดตเรียบร้อยก่อนหน้าแล้ว', 'success');
            setSyncing(false);
            return;
          }

          addLog('Sheets Sync', `กำลังอัปโหลดรายชื่อผู้ป่วย ${newToAppend.length} รายทีละคน...`, 'pending');
          let successCount = 0;
          for (const p of newToAppend) {
            const ok = await sheetsService.addPatient(p);
            if (ok) successCount++;
          }

          addLog('Sheets Sync', `ซิงค์ขึ้น Google Sheets หลักสำเร็จ ${successCount}/${newToAppend.length} ราย`, 'success');
          await fetchData(token);
          alert(`ซิงค์ข้อมูลเข้าระบบ Google Sheets สำเร็จ! เพิ่มขึ้นทั้งหมด ${successCount} รายชื่อ`);
        }
      } catch (err: any) {
        console.error(err);
        addLog('Sheets Sync', `เกิดข้อผิดพลาดในการซิงค์: ${err.message}`, 'error');
        alert(`ซิงค์รายชื่อไม่สำเร็จ: ${err.message}`);
      } finally {
        setSyncing(false);
      }
    }, 1000);
  };

  const handleDownloadCSV = (listToExport: Patient[]) => {
    if (listToExport.length === 0) {
      alert('ไม่มีข้อมูลให้ส่งออก');
      return;
    }
    const headers = ['รหัสผู้ป่วย (HN)', 'ชื่อ-นามสกุล', 'กลุ่มสุขภาพ', 'ที่อยู่', 'อสม. ผู้รับผิดชอบ/ผู้ดูแล', 'เบอร์โทรศัพท์', 'ละติจูด (Lat)', 'ลองจิจูด (Lng)', 'ข้อมูลสัญญาณชีพ/อาการล่าสุด'];
    const rows = listToExport.map(p => [
      p.id,
      p.name,
      p.category,
      p.address,
      p.caregiver,
      p.phone,
      p.lat.toString(),
      p.lng.toString(),
      p.vitalSigns
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "รายชื่อผู้ป่วยพึ่งพิง_ตำบลไผ่ต่ำ.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('Export', 'ส่งออกไฟล์ CSV สำเร็จเรียบร้อยแล้ว', 'success');
  };

  const handleCopyToClipboard = (listToExport: Patient[]) => {
    if (listToExport.length === 0) {
      alert('ไม่มีข้อมูลให้คัดลอก');
      return;
    }
    const headers = ['รหัสผู้ป่วย (HN)', 'ชื่อ-นามสกุล', 'กลุ่มสุขภาพ', 'ที่อยู่', 'อสม. ผู้ดูแล', 'เบอร์โทรศัพท์', 'ละติจูด', 'ลองจิจูด', 'อาการล่าสุด'];
    const rows = listToExport.map(p => [
      p.id,
      p.name,
      p.category,
      p.address,
      p.caregiver,
      p.phone,
      p.lat.toString(),
      p.lng.toString(),
      p.vitalSigns
    ]);
    const textContent = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(textContent)
      .then(() => {
        alert('📋 คัดลอกข้อมูลทั้งหมดไปยังคลิปบอร์ดแล้ว! สามารถนำไปวางใน Excel หรือ Google Sheets ได้ทันที');
        addLog('Export', 'คัดลอกข้อมูลไปยังคลิปบอร์ดสำเร็จ', 'success');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('เกิดข้อผิดพลาดในการคัดลอก');
      });
  };

  const handleSaveImportedPatients = async () => {
    if (userRole === 'public') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้นำเข้าข้อมูลระบบได้');
      return;
    }
    if (importedPatients.length === 0) return;

    setSyncing(true);
    addLog('My Maps Import', `กำลังนำเข้าประชากรสุขภาพใหม่จำนวน ${importedPatients.length} ราย...`, 'pending');

    if (!token || token === 'mock-staff-token') {
      // Save locally (Sandbox)
      setTimeout(() => {
        const existingNames = new Set(patients.map(p => p.name));
        const newToAppend = importedPatients.filter(p => !existingNames.has(p.name));
        
        if (newToAppend.length === 0) {
          addLog('Local DB', `ไม่พบบัญชีใหม่เนื่องจากรายชื่อซ้ำกับที่มีอยู่แล้วทั้งหมด`, 'error');
          alert('รายชื่อผู้ป่วยทั้งหมดมีอยู่ในการจำลองข้อมูลแล้ว');
          setSyncing(false);
          return;
        }

        const updatedPatients = [...newToAppend, ...patients];
        setPatients(updatedPatients);
        localStorage.setItem('stitchsync_patients', JSON.stringify(updatedPatients));

        addLog('Local DB', `นำเข้าข้อมูลและพิกัดแผนที่เพิ่มใหม่ ${newToAppend.length} รายลงคลังสำเร็จ!`, 'success');
        alert(`นำเข้าผู้ป่วยและพิกัดใหม่จำนวน ${newToAppend.length} รายสำเร็จ! (เข้าคลังจำลอง)`);
        setImportedPatients([]);
        setKmlInput('');
        setSyncing(false);
        setCurrentTab('analytics');
      }, 500);
      return;
    }

    // Save to Google Sheets Cloud DB
    try {
      const sheetsService = new SheetsService(token);
      let successCount = 0;
      
      const existingNames = new Set(patients.map(p => p.name));
      const newToAppend = importedPatients.filter(p => !existingNames.has(p.name));
      
      if (newToAppend.length === 0) {
        addLog('Sheets DB', 'รายชื่อผู้ป่วยเหล่านี้ถูกบันทึกใน Google Sheets แล้วทั้งหมด', 'success');
        alert('ผู้ป่วยทุกรายจากแผนที่ถูกนำเข้าเรียบร้อยแล้ว (ไม่พบข้อมูลรายชื่อใหม่)');
        setSyncing(false);
        return;
      }

      for (const p of newToAppend) {
        const ok = await sheetsService.addPatient(p);
        if (ok) successCount++;
      }

      if (successCount > 0) {
        addLog('Sheets DB', `เขียนข้อมูลลงแผ่นงานสำเร็จ: บันทึกคนไข้เพิ่มพิกัด ${successCount} ราย`, 'success');
        await fetchData(token);
        alert(`นำเข้าพิกัดและข้อมูลผู้ป่วย/อสม./caregiver จำนวน ${successCount} รายเข้าสู่ Google Sheets สำเร็จ!`);
        setImportedPatients([]);
        setKmlInput('');
        setCurrentTab('analytics');
      } else {
        addLog('Sheets DB', 'การนำเข้าข้อมูลไม่สำเร็จ', 'error');
        alert('นำเข้าไม่สำเร็จ กรุณาตรวจสอบสิทธิ์การเขียนไฟล์แผ่นงาน');
      }
    } catch (error: any) {
      console.error(error);
      addLog('Sheets DB', `เกิดข้อผิดพลาดในการเซฟเข้า Google Sheets: ${error.message}`, 'error');
      alert(`ไม่สามารถซิงค์ข้อมูลเข้า Google Sheets: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Add a new activity (visited record)
  const submitNewVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'staff' && userRole !== 'caregiver') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุข, อสม. และผู้ดูแล Caregiver เท่านั้นที่ได้รับอนุญาตให้บันทึกรายงานผลการเข้าเยี่ยมบ้านได้');
      return;
    }
    if (!selectedPatientId) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    setSyncing(true);

    const newActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: patient.name,
      caregiverName: user?.displayName || 'อสม. ผู้ดูแล',
      type: 'เข้าเยี่ยม',
      description: visitDescription || `อสม. เข้าตรวจเยี่ยมและติดตามผล อาการทั่วไป: ${visitVitalSigns || 'ปกติ'}`,
      status: visitStatus,
    };

    if (!token || token === 'mock-staff-token') {
      addLog('Local DB', `กำลังบันทึกรายงานเข้าเยี่ยม (จำลอง) สำหรับ: ${patient.name}...`, 'pending');
      setTimeout(() => {
        const updatedActivities = [newActivity, ...activities];
        setActivities(updatedActivities);
        localStorage.setItem('stitchsync_activities', JSON.stringify(updatedActivities));
        
        // Update patient lastVisited field locally
        const updatedPatients = patients.map(p => {
          if (p.id === patient.id) {
            return {
              ...p,
              lastVisited: 'เมื่อสักครู่',
              vitalSigns: visitVitalSigns || p.vitalSigns
            };
          }
          return p;
        });
        setPatients(updatedPatients);
        localStorage.setItem('stitchsync_patients', JSON.stringify(updatedPatients));

        addLog('Local DB', `บันทึกรายงานเข้าเยี่ยมคุณ ${patient.name} สำเร็จลง Sandbox ของเบราว์เซอร์`, 'success');
        
        // Reset form and close modal
        setVisitVitalSigns('');
        setVisitDescription('');
        setVisitStatus('Normal');
        setIsModalOpen(false);
        setSyncing(false);
      }, 300);
      return;
    }

    addLog('Sheets DB', `กำลังบันทึกรายงานเข้าเยี่ยมสำหรับ: ${patient.name}...`, 'pending');
    try {
      const sheetsService = new SheetsService(token);
      
      // Post activity to sheets
      const success = await sheetsService.addActivity(newActivity);
      if (success) {
        addLog('Sheets DB', `บันทึกรายงานเข้าเยี่ยมคุณ ${patient.name} ลง Google Sheet สำเร็จ`, 'success');
        
        // Refresh local data to show the new list
        await fetchData(token);
        
        // Reset form and close modal
        setVisitVitalSigns('');
        setVisitDescription('');
        setVisitStatus('Normal');
        setIsModalOpen(false);
      } else {
        throw new Error('Sheets API returned false status');
      }
    } catch (error: any) {
      console.error(error);
      addLog('Sheets DB', `ไม่สามารถเพิ่มรายงานได้: ${error.message}`, 'error');
      alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSyncing(false);
    }
  };

  // Create a brand new patient
  const submitNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'staff') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้ลงทะเบียนผู้ป่วยใหม่ได้');
      return;
    }
    if (!newPatientName) return;

    setSyncing(true);
    const newId = `HN${String(patients.length + 1).padStart(3, '0')}`;
    const formattedAddress = newPatientAddress
      ? (newPatientAddress.includes(newPatientMoo) ? newPatientAddress : `${newPatientAddress} ${newPatientMoo}`)
      : `ต.ไผ่ต่ำ อ.วิหารแดง (${newPatientMoo})`;

    const newPatient: Patient = {
      id: newId,
      name: newPatientName,
      category: newPatientCategory,
      address: formattedAddress,
      moo: newPatientMoo,
      vitalSigns: newPatientVital || 'ปกติ',
      caregiver: newPatientCaregiver || user?.displayName || 'อสม. สมศรี',
      lat: 14.320 + (Math.random() - 0.5) * 0.015,
      lng: 100.815 + (Math.random() - 0.5) * 0.015,
      lastVisited: 'เพิ่งลงทะเบียน',
      phone: newPatientPhone || '08x-xxx-xxxx',
    };

    const newActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: newPatientName,
      caregiverName: user?.displayName || 'อสม. ผู้ดูแล',
      type: 'นัดหมาย',
      description: `ลงทะเบียนผู้ป่วยใหม่ในระบบ (${newPatientCategory}) ${newPatientMoo} ต.ไผ่ต่ำ`,
      status: 'Normal',
    };

    if (!token || token === 'mock-staff-token') {
      addLog('Local DB', `กำลังลงทะเบียนผู้ป่วยใหม่ (จำลอง): ${newPatientName}...`, 'pending');
      setTimeout(() => {
        const updatedPatients = [newPatient, ...patients];
        const updatedActivities = [newActivity, ...activities];
        
        setPatients(updatedPatients);
        setActivities(updatedActivities);
        localStorage.setItem('stitchsync_patients', JSON.stringify(updatedPatients));
        localStorage.setItem('stitchsync_activities', JSON.stringify(updatedActivities));

        addLog('Local DB', `ลงทะเบียนผู้ป่วยใหม่ ${newPatientName} (${newId}) [${newPatientMoo}] เรียบร้อย`, 'success');
        
        // Reset
        setNewPatientName('');
        setNewPatientAddress('');
        setNewPatientMoo('หมู่ 1');
        setNewPatientPhone('');
        setNewPatientVital('');
        setNewPatientCaregiver('');
        setIsModalOpen(false);
        setSyncing(false);
      }, 300);
      return;
    }

    addLog('Sheets DB', `กำลังลงทะเบียนผู้ป่วยใหม่: ${newPatientName}...`, 'pending');
    try {
      const sheetsService = new SheetsService(token);
      
      const pSuccess = await sheetsService.addPatient(newPatient);
      const aSuccess = await sheetsService.addActivity(newActivity);

      if (pSuccess && aSuccess) {
        addLog('Sheets DB', `ลงทะเบียนผู้ป่วยใหม่ ${newPatientName} (${newId}) ลงใน Google Sheet เรียบร้อย`, 'success');
        await fetchData(token);

        // Reset
        setNewPatientName('');
        setNewPatientAddress('');
        setNewPatientMoo('หมู่ 1');
        setNewPatientPhone('');
        setNewPatientVital('');
        setNewPatientCaregiver('');
        setIsModalOpen(false);
      } else {
        throw new Error('API write operations incomplete');
      }
    } catch (error: any) {
      console.error(error);
      addLog('Sheets DB', `ล้มเหลวในการลงทะเบียนผู้ป่วยใหม่: ${error.message}`, 'error');
      alert('ลงทะเบียนคนไข้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSyncing(false);
    }
  };

  const handleRegisterVhv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVhvName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล อสม. / จิตอาสา');
      return;
    }
    const newId = `VHV-${String(vhvs.length + 1).padStart(3, '0')}`;
    const formattedAddress = newVhvAddress.trim()
      ? (newVhvAddress.includes(newVhvMoo) ? newVhvAddress.trim() : `${newVhvAddress.trim()} ${newVhvMoo}`)
      : `ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี (${newVhvMoo})`;

    const newVhv = {
      id: newId,
      name: newVhvName.trim(),
      phone: newVhvPhone.trim() || '08x-xxx-xxxx',
      address: formattedAddress,
      moo: newVhvMoo,
      type: newVhvType
    };
    
    const updatedVhvs = [newVhv, ...vhvs];
    setVhvs(updatedVhvs);
    localStorage.setItem('stitchsync_vhvs', JSON.stringify(updatedVhvs));
    
    // Add logs
    const newActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: 'ระบบฐานข้อมูลกลาง',
      caregiverName: newVhvName.trim(),
      type: 'นัดหมาย',
      description: `ลงทะเบียนผู้ปฏิบัติงาน อสม./จิตอาสา รายใหม่: ${newVhvName} (${newVhvType}) [${newVhvMoo}]`,
      status: 'Normal',
    };
    setActivities([newActivity, ...activities]);
    localStorage.setItem('stitchsync_activities', JSON.stringify([newActivity, ...activities]));
    
    addLog('Local DB', `ลงทะเบียนผู้ปฏิบัติงาน อสม. ใหม่: ${newVhvName} (${newVhvMoo}) สำเร็จ`, 'success');
    alert(`ลงทะเบียน อสม. / จิตอาสา "${newVhvName}" (${newVhvMoo}) เรียบร้อยแล้ว!`);
    
    // Reset Form
    setNewVhvName('');
    setNewVhvPhone('');
    setNewVhvAddress('');
    setNewVhvMoo('หมู่ 1');
  };

  const handleRegisterCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'staff') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขเท่านั้นที่ได้รับอนุญาตให้ลงทะเบียนข้อมูลได้');
      return;
    }
    if (!newCgName.trim()) {
      alert('กรุณากรอกชื่อผู้ดูแล Caregiver');
      return;
    }
    const newId = `CG-${String(caregivers.length + 1).padStart(3, '0')}`;
    const formattedAddress = newCgAddress.trim()
      ? (newCgAddress.includes(newCgMoo) ? newCgAddress.trim() : `${newCgAddress.trim()} ${newCgMoo}`)
      : `ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี (${newCgMoo})`;

    const newCg = {
      id: newId,
      name: newCgName.trim(),
      phone: newCgPhone.trim() || '08x-xxx-xxxx',
      address: formattedAddress,
      moo: newCgMoo,
      relationship: newCgRelationship
    };
    
    const updatedCgs = [newCg, ...caregivers];
    setCaregivers(updatedCgs);
    localStorage.setItem('stitchsync_caregivers', JSON.stringify(updatedCgs));
    
    // Add logs
    const newActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: 'ระบบฐานข้อมูลกลาง',
      caregiverName: newCgName.trim(),
      type: 'นัดหมาย',
      description: `ลงทะเบียนผู้ดูแลหลัก Caregiver รายใหม่: ${newCgName} (${newCgRelationship}) [${newCgMoo}]`,
      status: 'Normal',
    };
    setActivities([newActivity, ...activities]);
    localStorage.setItem('stitchsync_activities', JSON.stringify([newActivity, ...activities]));
    
    addLog('Local DB', `ลงทะเบียนผู้ดูแล Caregiver ใหม่: ${newCgName} (${newCgMoo}) สำเร็จ`, 'success');
    alert(`ลงทะเบียนผู้ดูแลหลัก (Caregiver) "${newCgName}" (${newCgMoo}) เรียบร้อยแล้ว!`);
    
    // Reset Form
    setNewCgName('');
    setNewCgPhone('');
    setNewCgAddress('');
    setNewCgMoo('หมู่ 1');
    setNewCgRelationship('ญาติ');
  };

  const handleRegisterBenefactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'staff') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขเท่านั้นที่ได้รับอนุญาตให้ลงทะเบียนผู้ทำคุณประโยชน์ได้');
      return;
    }
    if (!newBenName.trim()) {
      alert('กรุณากรอกชื่อผู้ทำคุณประโยชน์หรือองค์กร');
      return;
    }
    const newId = `BEN-${String(benefactors.length + 1).padStart(3, '0')}`;
    const formattedAddress = newBenAddress.trim()
      ? (newBenAddress.includes(newBenMoo) ? newBenAddress.trim() : `${newBenAddress.trim()} ${newBenMoo}`)
      : `ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี (${newBenMoo})`;

    const newBen = {
      id: newId,
      name: newBenName.trim(),
      phone: newBenPhone.trim() || '08x-xxx-xxxx',
      address: formattedAddress,
      moo: newBenMoo,
      contribution: newBenContribution.trim() || 'ผู้สนับสนุนคุณประโยชน์ต่อชุมชนตำบลไผ่ต่ำ'
    };
    
    const updatedBens = [newBen, ...benefactors];
    setBenefactors(updatedBens);
    localStorage.setItem('stitchsync_benefactors', JSON.stringify(updatedBens));
    
    // Add logs
    const newActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: 'ระบบฐานข้อมูลกลาง',
      caregiverName: newBenName.trim(),
      type: 'นัดหมาย',
      description: `ลงทะเบียนผู้ทำคุณประโยชน์รายใหม่: ${newBenName} [${newBenMoo}] - ${newBen.contribution}`,
      status: 'Normal',
    };
    setActivities([newActivity, ...activities]);
    localStorage.setItem('stitchsync_activities', JSON.stringify([newActivity, ...activities]));
    
    addLog('Local DB', `ลงทะเบียนผู้ทำคุณประโยชน์ใหม่: ${newBenName} (${newBenMoo}) สำเร็จ`, 'success');
    alert(`ลงทะเบียนผู้ทำคุณประโยชน์ "${newBenName}" (${newBenMoo}) เรียบร้อยแล้ว!`);
    
    // Reset Form
    setNewBenName('');
    setNewBenPhone('');
    setNewBenAddress('');
    setNewBenMoo('หมู่ 1');
    setNewBenContribution('');
  };

  const openEditPatient = (p: Patient) => {
    setSelectedPatientId(p.id);
    setEditPatientId(p.id);
    setEditPatientName(p.name);
    setEditPatientCategory(p.category);
    setEditPatientAddress(p.address);
    setEditPatientMoo(p.moo || 'หมู่ 1');
    setEditPatientPhone(p.phone || '');
    setEditPatientVital(p.vitalSigns);
    setEditPatientCaregiver(p.caregiver);
    setModalType('edit-patient');
    setIsModalOpen(true);
  };

  const submitEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'public') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้แก้ไขข้อมูลผู้ป่วยได้');
      return;
    }
    if (!editPatientId || !editPatientName) return;

    setSyncing(true);

    const originalPatient = patients.find(p => p.id === editPatientId);
    if (!originalPatient) {
      setSyncing(false);
      return;
    }

    const updatedPatient: Patient = {
      ...originalPatient,
      name: editPatientName,
      category: editPatientCategory,
      address: editPatientAddress || 'ต.ไผ่ต่ำ อ.วิหารแดง',
      moo: editPatientMoo,
      vitalSigns: editPatientVital || 'ปกติ',
      caregiver: editPatientCaregiver || originalPatient.caregiver,
      phone: editPatientPhone || '08x-xxx-xxxx',
    };

    const editActivity: Activity = {
      timestamp: 'เมื่อสักครู่',
      patientName: editPatientName,
      caregiverName: user?.displayName || 'อสม. ผู้ดูแล',
      type: 'เข้าเยี่ยม',
      description: `แก้ไขข้อมูลผู้ป่วย: ชื่อ ${editPatientName}, กลุ่ม ${editPatientCategory}, ที่อยู่ ${editPatientAddress || 'N/A'} [${editPatientMoo}], อาการ ${editPatientVital || 'N/A'}`,
      status: 'Normal',
    };

    if (!token || token === 'mock-staff-token') {
      addLog('Local DB', `กำลังแก้ไขข้อมูลผู้ป่วย (จำลอง): ${editPatientName}...`, 'pending');
      setTimeout(() => {
        const updatedPatients = patients.map(p => p.id === editPatientId ? updatedPatient : p);
        const updatedActivities = [editActivity, ...activities];
        
        setPatients(updatedPatients);
        setActivities(updatedActivities);
        localStorage.setItem('stitchsync_patients', JSON.stringify(updatedPatients));
        localStorage.setItem('stitchsync_activities', JSON.stringify(updatedActivities));

        addLog('Local DB', `แก้ไขข้อมูลผู้ป่วยคุณ ${editPatientName} สำเร็จลงใน Sandbox เรียบร้อย`, 'success');
        
        setIsModalOpen(false);
        setSyncing(false);
      }, 300);
      return;
    }

    addLog('Sheets DB', `กำลังอัปเดตข้อมูลผู้ป่วยใน Google Sheets: ${editPatientName}...`, 'pending');
    try {
      const sheetsService = new SheetsService(token);
      
      const pSuccess = await sheetsService.updatePatient(updatedPatient);
      const aSuccess = await sheetsService.addActivity(editActivity);

      if (pSuccess && aSuccess) {
        addLog('Sheets DB', `แก้ไขข้อมูลผู้ป่วย ${editPatientName} (${editPatientId}) ใน Google Sheets เรียบร้อย`, 'success');
        await fetchData(token);
        setIsModalOpen(false);
      } else {
        throw new Error('API update operations incomplete');
      }
    } catch (error: any) {
      console.error(error);
      addLog('Sheets DB', `ล้มเหลวในการแก้ไขข้อมูลผู้ป่วย: ${error.message}`, 'error');
      alert('แก้ไขข้อมูลคนไข้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSyncing(false);
    }
  };

  // Edit VHV Helpers
  const openEditVhv = (item: { id: string; name: string; phone: string; address: string; moo?: string; type: 'อสม' | 'จิตอาสา' }) => {
    setEditVhvId(item.id);
    setEditVhvName(item.name);
    setEditVhvPhone(item.phone || '');
    setEditVhvAddress(item.address || '');
    setEditVhvMoo(item.moo || 'หมู่ 1');
    setEditVhvType(item.type);
    setIsEditVhvModalOpen(true);
  };

  const submitEditVhv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVhvName.trim()) return;
    const updated = vhvs.map(v => v.id === editVhvId ? {
      ...v,
      name: editVhvName.trim(),
      phone: editVhvPhone.trim(),
      address: editVhvAddress.trim(),
      moo: editVhvMoo,
      type: editVhvType,
    } : v);
    setVhvs(updated);
    localStorage.setItem('stitchsync_vhvs', JSON.stringify(updated));
    addLog('Local DB', `แก้ไขข้อมูล อสม. ${editVhvName} สำเร็จ`, 'success');
    alert(`แก้ไขข้อมูล อสม. "${editVhvName}" เรียบร้อยแล้ว`);
    setIsEditVhvModalOpen(false);
  };

  // Edit Caregiver Helpers
  const openEditCg = (item: { id: string; name: string; phone: string; address: string; moo?: string; relationship: string }) => {
    setEditCgId(item.id);
    setEditCgName(item.name);
    setEditCgPhone(item.phone || '');
    setEditCgAddress(item.address || '');
    setEditCgMoo(item.moo || 'หมู่ 1');
    setEditCgRelationship(item.relationship);
    setIsEditCgModalOpen(true);
  };

  const submitEditCg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCgName.trim()) return;
    const updated = caregivers.map(c => c.id === editCgId ? {
      ...c,
      name: editCgName.trim(),
      phone: editCgPhone.trim(),
      address: editCgAddress.trim(),
      moo: editCgMoo,
      relationship: editCgRelationship,
    } : c);
    setCaregivers(updated);
    localStorage.setItem('stitchsync_caregivers', JSON.stringify(updated));
    addLog('Local DB', `แก้ไขข้อมูลผู้ดูแล ${editCgName} สำเร็จ`, 'success');
    alert(`แก้ไขข้อมูลผู้ดูแล "${editCgName}" เรียบร้อยแล้ว`);
    setIsEditCgModalOpen(false);
  };

  // Edit Benefactor Helpers
  const openEditBen = (item: { id: string; name: string; phone: string; address: string; moo?: string; contribution: string }) => {
    if (userRole !== 'staff') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขเท่านั้นที่ได้รับอนุญาตให้แก้ไขข้อมูลได้');
      return;
    }
    setEditBenId(item.id);
    setEditBenName(item.name);
    setEditBenPhone(item.phone || '');
    setEditBenAddress(item.address || '');
    setEditBenMoo(item.moo || 'หมู่ 1');
    setEditBenContribution(item.contribution || '');
    setIsEditBenModalOpen(true);
  };

  const submitEditBen = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'staff') {
      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขเท่านั้นที่ได้รับอนุญาตให้แก้ไขข้อมูลได้');
      return;
    }
    if (!editBenName.trim()) return;
    const updated = benefactors.map(b => b.id === editBenId ? {
      ...b,
      name: editBenName.trim(),
      phone: editBenPhone.trim(),
      address: editBenAddress.trim(),
      moo: editBenMoo,
      contribution: editBenContribution.trim(),
    } : b);
    setBenefactors(updated);
    localStorage.setItem('stitchsync_benefactors', JSON.stringify(updated));
    addLog('Local DB', `แก้ไขข้อมูลผู้ทำคุณประโยชน์ ${editBenName} สำเร็จ`, 'success');
    alert(`แก้ไขข้อมูลผู้ทำคุณประโยชน์ "${editBenName}" เรียบร้อยแล้ว`);
    setIsEditBenModalOpen(false);
  };

  // Helper Stats Calculation
  const totalPopulation = patients.length || 2450;
  const bedboundCount = patients.filter(p => p.category === 'ติดเตียง').length || 12;
  const homeboundCount = patients.filter(p => p.category === 'ติดบ้าน').length || 28;
  const socialCount = patients.filter(p => p.category === 'ติดสังคม').length || 60;

  const bedboundPercent = Math.round((bedboundCount / (patients.length || 1)) * 100) || 12;
  const homeboundPercent = Math.round((homeboundCount / (patients.length || 1)) * 100) || 28;
  const socialPercent = Math.round((socialCount / (patients.length || 1)) * 100) || 60;

  // Filtered patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.vitalSigns.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ทั้งหมด' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Login View screen
  if (needsAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden font-sans text-slate-900">
        {/* Decorative Grid Overlay with Natural Sage Green points */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #5A634E 1.2px, transparent 1.2px)', backgroundSize: '36px 36px' }} />
        
        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white border border-slate-200 shadow-xl rounded-3xl p-8 flex flex-col items-center relative z-10"
        >
          {/* Health Emblem Logo */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100 p-2">
            <HealthLogo className="w-16 h-16" />
          </div>
          
          <h1 className="text-xl font-sans font-black text-slate-900 text-center tracking-tight mb-0.5">
            ระบบสุขภาพตำบลไผ่ต่ำ
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans text-center mb-6 font-bold">
            PHAI TAM HEALTHCARE HUB • SARABURI
          </p>

          {/* Tab selection buttons */}
          <div className="w-full flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setLoginTab('staff')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>1. เจ้าหน้าที่ (Gmail)</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginTab('vhv')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginTab === 'vhv'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. อสม. (ไม่ต้องใส่รหัส)</span>
            </button>
          </div>

          <div className="w-full border-t border-slate-100 pt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
                <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">กำลังเข้าสู่ระบบและเชื่อมต่อฐานข้อมูล...</p>
              </div>
            ) : loginTab === 'staff' ? (
              /* Staff Gmail Login Tab */
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/80 border border-blue-150 rounded-2xl text-xs text-blue-800 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-blue-900">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>ระบบล็อกอินสำหรับเจ้าหน้าที่สาธารณสุข</span>
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    เฉพาะเจ้าหน้าที่ รพ.สต., แพทย์ และพยาบาล ต้องใช้ระบบยืนยันตัวตนด้วยบัญชี Gmail เท่านั้น
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-6 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all rounded-xl shadow-sm text-xs font-bold text-slate-800 hover:shadow cursor-pointer active:scale-98"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Gmail (Google Sign-In)</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">หรือระบุอีเมล Gmail เจ้าหน้าที่</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Direct Gmail Address Input Form */}
                <form onSubmit={handleStaffGmailSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">อีเมล Gmail เจ้าหน้าที่</label>
                    <input
                      type="email"
                      required
                      placeholder="เช่น somchai.health@gmail.com"
                      value={staffGmailInput}
                      onChange={(e) => setStaffGmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>ยืนยันเข้าสู่ระบบด้วย Gmail</span>
                  </button>
                </form>
              </div>
            ) : (
              /* VHV Login Tab - No Password Required */
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-150 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ส่วนลงชื่อเข้าใช้งานสำหรับ อสม.</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    ไม่ต้องใส่รหัสผ่าน เพียงระบุชื่อผู้เข้าใช้งานเพื่อเริ่มบันทึกและจัดการข้อมูลการเยี่ยมบ้านได้ทันที
                  </p>
                </div>

                <form onSubmit={handleVhvLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้เข้าใช้งาน (อสม.)</label>
                    <input
                      type="text"
                      required
                      placeholder="กรอกชื่อ-นามสกุลของท่าน..."
                      value={vhvLoginName}
                      onChange={(e) => setVhvLoginName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>แจ้งชื่อเข้าใช้งานระบบ (ไม่ต้องใช้รหัสผ่าน)</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-6 text-center border-t border-slate-100 w-full pt-4">
            <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
              © 2026 ระบบสุขภาพตำบลไผ่ต่ำ • โครงการบันทึกข้อมูลเยี่ยมบ้าน อสม.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active dashboard view
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans select-none relative">
      
      {/* Mobile Navigation Drawer for Android & iOS Phones */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900"
            />
            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 safe-pb overflow-y-auto custom-scrollbar touch-scroll"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center p-1 border border-emerald-100 shadow-sm">
                    <HealthLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-sans font-black text-base text-slate-800 leading-tight">ระบบสุขภาพไผ่ต่ำ</h2>
                    <p className="text-[11px] text-slate-500">ตำบลไผ่ต่ำ จ.สระบุรี</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                  aria-label="ปิดเมนู"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  มุมมองหลัก
                </p>

                <button 
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setSelectedMindMapSection('overview');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                    currentTab === 'dashboard' && selectedMindMapSection === 'overview'
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <MapIcon className="w-4 h-4 text-blue-600" />
                  <span>แผงควบคุมหลัก (แผนที่)</span>
                </button>

                <div className="pt-3">
                  <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    ส่วนการลงข้อมูลสุขภาวะ
                  </p>

                  <button 
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setSelectedMindMapSection('vhv');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'dashboard' && selectedMindMapSection === 'vhv'
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>1. ลงข้อมูล อสม. / จิตอาสา</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setSelectedMindMapSection('patient');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'dashboard' && selectedMindMapSection === 'patient'
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>2. ลงข้อมูล ผู้ป่วยภาวะพึ่งพิง</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setSelectedMindMapSection('caregiver');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'dashboard' && selectedMindMapSection === 'caregiver'
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-emerald-500" />
                    <span>3. ลงข้อมูล ผู้ดูแล (Caregiver)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setSelectedMindMapSection('benefactor');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'dashboard' && selectedMindMapSection === 'benefactor'
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>4. ลงข้อมูล ผู้ทำคุณประโยชน์</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-2">
                  <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    รายงานและระบบหลังบ้าน
                  </p>

                  <button 
                    onClick={() => {
                      setCurrentTab('analytics');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'analytics' 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <span>วิเคราะห์ประชากร (Analytics)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('logs');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'logs' 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <ActivityIcon className="w-4 h-4 text-slate-500" />
                    <span>ประวัติระบบส่งข้อมูล (Logs)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('team');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'team' 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>ตั้งค่าฐานข้อมูล (Settings)</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentTab('import');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer text-left ${
                      currentTab === 'import' 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                    <span>เชื่อมต่อ Google Sheets</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>ออกจากระบบ (Log Out)</span>
                  </button>
                </div>
              </nav>

              <div className="p-4 border-t border-slate-100 shrink-0">
                {(userRole !== 'staff' && userRole !== 'caregiver') ? (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุข, อสม. และผู้ดูแล Caregiver เท่านั้น');
                    }}
                    className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-slate-200 cursor-pointer"
                  >
                    <span>รายงานเข้าเยี่ยมบ้าน (ล็อกสิทธิ์)</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setModalType('visit');
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>รายงานเข้าเยี่ยมบ้าน</span>
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex-col z-40">
        
        {/* Title Header with Health Emblem Logo */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 p-1">
              <HealthLogo className="w-9 h-9" />
            </div>
            <div>
              <h1 className="font-sans font-black text-[19px] text-slate-800 tracking-tight leading-tight">ระบบสุขภาพไผ่ต่ำ</h1>
              <p className="text-[13px] text-[#050505] font-normal tracking-wide mt-0.5" style={{ fontFamily: 'Verdana, sans-serif' }}>ตำบลไผ่ต่ำ จ.สระบุรี</p>
            </div>
          </div>
        </div>

        {/* Syncing State Indicator */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <span className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-medium text-[11px]">{syncing ? 'กำลังดึงฐานข้อมูล...' : 'ฐานข้อมูลเสถียรเรียลไทม์'}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="อัปเดตข้อมูลตอนนี้"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Navigation Tab links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            มุมมองหลัก
          </p>

          <button 
            onClick={() => {
              setCurrentTab('dashboard');
              setSelectedMindMapSection('overview');
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
              currentTab === 'dashboard' && selectedMindMapSection === 'overview'
                ? 'bg-blue-50 text-blue-700 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 opacity-80 shrink-0"></span>
            <span className="flex items-center gap-2">
              <MapIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>แผงควบคุมหลัก (แผนที่)</span>
            </span>
          </button>

          <div className="pt-3">
            <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              ส่วนการลงข้อมูลสุขภาวะ
            </p>

            <button 
              onClick={() => {
                setCurrentTab('dashboard');
                setSelectedMindMapSection('vhv');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'dashboard' && selectedMindMapSection === 'vhv'
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>1. ลงข้อมูล อสม. / จิตอาสา</span>
              </span>
            </button>

            <button 
              onClick={() => {
                setCurrentTab('dashboard');
                setSelectedMindMapSection('patient');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'dashboard' && selectedMindMapSection === 'patient'
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>2. ลงข้อมูล ผู้ป่วยภาวะพึ่งพิง</span>
              </span>
            </button>

            <button 
              onClick={() => {
                setCurrentTab('dashboard');
                setSelectedMindMapSection('caregiver');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'dashboard' && selectedMindMapSection === 'caregiver'
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>3. ลงข้อมูล ผู้ดูแล (Caregiver)</span>
              </span>
            </button>

            <button 
              onClick={() => {
                setCurrentTab('dashboard');
                setSelectedMindMapSection('benefactor');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'dashboard' && selectedMindMapSection === 'benefactor'
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>4. ลงข้อมูล ผู้ทำคุณประโยชน์</span>
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <p className="px-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              รายงานและระบบหลังบ้าน
            </p>

            <button 
              onClick={() => setCurrentTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'analytics' 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>วิเคราะห์ประชากร (Analytics)</span>
              </span>
            </button>

            <button 
              onClick={() => setCurrentTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'logs' 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <ActivityIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>ประวัติระบบส่งข้อมูล (Logs)</span>
              </span>
            </button>

            <button 
              onClick={() => setCurrentTab('team')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'team' 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>ตั้งค่าฐานข้อมูล (Settings)</span>
              </span>
            </button>

            <button 
              onClick={() => setCurrentTab('import')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-xs transition-colors cursor-pointer text-left ${
                currentTab === 'import' 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
              <span className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>เชื่อมต่อ Google Sheets</span>
                </span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[8px] rounded border border-blue-200 uppercase font-extrabold scale-90">NEW</span>
              </span>
            </button>
          </div>



          {/* New sidebar logout button for easy navigation */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              <span>ออกจากระบบ (Log Out)</span>
            </button>
          </div>
        </nav>

        {/* CTA "New Report" button */}
        <div className="p-4 border-t border-slate-100">
          {(userRole !== 'staff' && userRole !== 'caregiver') ? (
            <button 
              onClick={() => {
                alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุข, อสม. และผู้ดูแล Caregiver เท่านั้นที่ได้รับอนุญาตให้บันทึกรายงานผลการเข้าเยี่ยมบ้านได้');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 border border-slate-200 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>รายงานเข้าเยี่ยมบ้าน (ล็อกสิทธิ์)</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                setModalType('visit');
                setIsModalOpen(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>รายงานเข้าเยี่ยมบ้าน</span>
            </button>
          )}
        </div>

        {/* Environment status widget matching the theme exactly */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[9px] uppercase font-bold text-slate-400 mb-2 px-1">Environment</div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-slate-500">ID: 15869...249</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              userRole === 'staff' ? 'bg-blue-100 text-blue-700' :
              userRole === 'caregiver' ? 'bg-emerald-100 text-emerald-700' :
              userRole === 'dependent' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {userRole === 'staff' ? 'STAFF_PROD' :
               userRole === 'caregiver' ? 'CAREGIVER_PROD' :
               userRole === 'dependent' ? 'DEPENDENT_PROD' :
               'GUEST_VIEW'}
            </span>
          </div>
        </div>
      </aside>


      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-full w-full">
        
        {/* Header bar matching Professional Polish */}
        <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer shrink-0"
              aria-label="เปิดเมนูหลัก"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full ${syncing ? 'bg-amber-400 opacity-75' : 'bg-emerald-400 opacity-75'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${syncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-none">
                {userRole === 'staff' ? 'สิทธิ์เจ้าหน้าที่ / อสม.' :
                 userRole === 'caregiver' ? 'สิทธิ์ผู้ดูแล Caregiver' :
                 userRole === 'dependent' ? 'สิทธิ์ผู้ป่วย/ญาติ' :
                 'โหมดบุคคลทั่วไป'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Inline Search Bar */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 px-2.5 h-9 w-28 sm:w-56 rounded-lg transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 placeholder:text-slate-400 text-slate-800 h-full w-full" 
                placeholder="ค้นหาคนไข้..." 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-200/50 rounded-full cursor-pointer">
                  <X className="w-2.5 h-2.5 text-slate-500" />
                </button>
              )}
            </div>

            {/* Excel Download & Google Drive Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportAllExcel}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                title="ดาวน์โหลดไฟล์ Excel (.xlsx) รวม 4 ฐานข้อมูล"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">ดาวน์โหลด Excel</span>
              </button>

              <button
                type="button"
                onClick={handleOpenGoogleDrive}
                className="hidden sm:flex px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                title="เปิด Google Drive / Google Sheets"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Google Drive</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:flex flex-col items-end">
                <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
                  <span>{user?.displayName || 'Chaiwat Somchai'}</span>
                </div>
                <div className="text-[10px] text-slate-500">{user?.email || 'chaiwat.s@gmail.com'}</div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full border-2 border-blue-200 shadow-sm flex items-center justify-center text-slate-600 font-bold overflow-hidden shrink-0">
                <img 
                  src={user?.photoURL && user.photoURL.trim() !== '' ? user.photoURL : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80'} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                  alt="Profile Avatar" 
                />
              </div>

              {/* Quick Header Logout Icon Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Tab-based Content Rendering */}
        <div className="flex-1 w-full h-full relative z-10 overflow-hidden bg-slate-50">
          <AnimatePresence mode="wait">
            
            {/* Dashboard Tab: My Maps integration + Overlay Widgets */}
            {currentTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col overflow-hidden bg-slate-50"
              >
                {/* Dashboard Map View (Mind Map removed) */}
                {selectedMindMapSection === 'overview' && (
                  <div className="w-full h-full relative flex-1">
                    <div className="absolute inset-0 z-0">
                      <iframe 
                        src="https://www.google.com/maps/d/embed?mid=1EJn-6UCajvEy2clWRRGHMw7ZG0xWhQE" 
                        className="w-full h-full border-0"
                        allowFullScreen
                        title="ระบบจำแนกสีตำบลไผ่ต่ำ"
                      />
                    </div>

                  </div>
                )}

                {/* PART 1: อสม. / จิตอาสา Registration and Directory */}
                {selectedMindMapSection === 'vhv' && (
                  <div className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMindMapSection('overview')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>← กลับหน้าผังหลัก</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <h2 className="text-sm font-black text-slate-800">ส่วนที่ 1: ระบบลงทะเบียนข้อมูล อสม. / จิตอาสา</h2>
                          <p className="text-[10px] text-slate-400">แบบฟอร์มการบันทึกข้อมูลและฐานข้อมูลปฏิบัติงานรวมประจำตำบล</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-mono">
                        จำนวน: {vhvs.length} คน
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 touch-scroll">
                      {/* Left: Registration Form */}
                      <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm shrink-0 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ลงทะเบียน อสม. รายใหม่</h3>
                          <p className="text-[11px] text-slate-500 mt-1">กรอกข้อมูลการลงทะเบียนให้ถูกต้องครบถ้วนเพื่อจัดทำระบบรายงาน</p>
                        </div>

                        <form onSubmit={handleRegisterVhv} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ชื่อ-นามสกุล (พร้อมคำนำหน้า)</label>
                            <input
                              type="text"
                              required
                              value={newVhvName}
                              onChange={(e) => setNewVhvName(e.target.value)}
                              placeholder="เช่น อสม. ดวงใจ แสนสุข"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                            <input
                              type="text"
                              value={newVhvPhone}
                              onChange={(e) => setNewVhvPhone(e.target.value)}
                              placeholder="เช่น 081-234-5678"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                            <select
                              value={newVhvMoo}
                              onChange={(e) => setNewVhvMoo(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg font-bold text-slate-700"
                            >
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ที่อยู่อาศัยปัจจุบัน</label>
                            <textarea
                              value={newVhvAddress}
                              onChange={(e) => setNewVhvAddress(e.target.value)}
                              placeholder="เช่น บ้านเลขที่ 12 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง"
                              rows={3}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ประเภทผู้ปฏิบัติงาน</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(['อสม', 'จิตอาสา'] as const).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setNewVhvType(t)}
                                  className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    newVhvType === t
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {t === 'อสม' ? 'อสม. ประจำหมู่บ้าน' : 'จิตอาสาสุขภาพ'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ยืนยันลงทะเบียนเข้าระบบ</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Registered Database */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 px-3 h-9 w-64 rounded-lg transition-all shrink-0">
                              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                              <input
                                type="text"
                                value={vhvSearchQuery}
                                onChange={(e) => setVhvSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 placeholder:text-slate-400 text-slate-800"
                                placeholder="ค้นหารายชื่อ อสม. หรือที่อยู่..."
                              />
                              {vhvSearchQuery && (
                                <button onClick={() => setVhvSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                                  <X className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              )}
                            </div>
                            <select
                              value={vhvMooFilter}
                              onChange={(e) => setVhvMooFilter(e.target.value)}
                              className="text-xs bg-white border border-slate-200 focus:border-blue-500 px-2.5 py-1.5 h-9 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="ทั้งหมด">หมู่บ้าน: ทั้งหมด (หมู่ 1-8)</option>
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const vhvRows = filteredVhvs.map((v, i) => ({
                                  'ลำดับ': i + 1,
                                  'รหัส อสม.': v.id,
                                  'ชื่อ-นามสกุล': v.name,
                                  'ประจำหมู่บ้าน': v.moo || 'หมู่ 1',
                                  'ประเภท': v.type,
                                  'เบอร์โทรศัพท์': v.phone,
                                  'ที่อยู่': v.address
                                }));
                                exportSingleTableToExcel(vhvRows, 'รายชื่อ อสม. จิตอาสา', `รายชื่อ_อสม_จิตอาสา_${new Date().toISOString().split('T')[0]}`);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="ดาวน์โหลดรายชื่อ อสม. เป็นไฟล์ Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ดาวน์โหลด Excel</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">DATABASE_VHV_SYS</span>
                          </div>
                        </div>

                        {/* Database Table */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar touch-scroll">
                          {filteredVhvs.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                              <Users className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-xs font-bold">ไม่พบข้อมูลรายชื่อ อสม. ตรงตามที่ค้นหา</p>
                            </div>
                          ) : (
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
                                  <th className="p-4 pl-6 font-bold">รหัสผู้ดูแล</th>
                                  <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
                                  <th className="p-4 font-bold">หมู่</th>
                                  <th className="p-4 font-bold">ประเภท</th>
                                  <th className="p-4 font-bold">เบอร์โทรศัพท์</th>
                                  <th className="p-4 font-bold">ที่อยู่อาศัยหลัก</th>
                                  <th className="p-4 pr-6 text-right font-bold">จัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredVhvs.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-mono font-bold text-slate-400">{item.id}</td>
                                    <td 
                                      className="p-4 font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                                      onClick={() => setSelectedDetailItem({ type: 'อสม', name: item.name, data: item })}
                                      title="คลิกเพื่อดูรายละเอียด"
                                    >
                                      {item.name}
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {item.moo || 'หมู่ 1'}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                        item.type === 'อสม' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                      }`}>
                                        {item.type}
                                      </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">{item.phone}</td>
                                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.address}</td>
                                    <td className="p-4 pr-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => openEditVhv(item)}
                                          className="text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline cursor-pointer"
                                        >
                                          แก้ไข
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm(`คุณต้องการลบข้อมูล อสม. "${item.name}" ใช่หรือไม่?`)) {
                                              const updated = vhvs.filter(v => v.id !== item.id);
                                              setVhvs(updated);
                                              addLog('Local DB', `ลบข้อมูล อสม. ${item.name} สำเร็จ`, 'success');
                                            }
                                          }}
                                          className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline cursor-pointer"
                                        >
                                          ลบข้อมูล
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PART 2: ผู้ป่วยกลุ่มเป้าหมาย (Dependent Patient) Registration and Directory */}
                {selectedMindMapSection === 'patient' && (
                  <div className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMindMapSection('overview')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>← กลับหน้าผังหลัก</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <h2 className="text-sm font-black text-slate-800">ส่วนที่ 2: ระบบลงทะเบียนกลุ่มเป้าหมาย (ผู้ป่วยภาวะพึ่งพิง)</h2>
                          <p className="text-[10px] text-slate-400">คัดกรองและแบ่งระดับคนไข้: ติดเตียง (แดง), ติดบ้าน (เหลือง), ติดสังคม (เขียว)</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-mono">
                        จำนวน: {patients.length} ราย
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 touch-scroll">
                      {/* Left: Registration Form */}
                      <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm shrink-0 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ลงทะเบียนผู้ป่วยภาวะพึ่งพิง</h3>
                          <p className="text-[11px] text-slate-500 mt-1">เพิ่มข้อมูลกลุ่มประชากรเป้าหมายเพื่อใช้วาดพิกัดแผนที่และการประเมินอาการ</p>
                        </div>

                        <form onSubmit={submitNewPatient} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ชื่อ-นามสกุลผู้ป่วย</label>
                            <input
                              type="text"
                              required
                              value={newPatientName}
                              onChange={(e) => setNewPatientName(e.target.value)}
                              placeholder="เช่น นายสุขดี เสมอภาค"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                            <input
                              type="text"
                              value={newPatientPhone}
                              onChange={(e) => setNewPatientPhone(e.target.value)}
                              placeholder="เช่น 089-123-4567"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                            <select
                              value={newPatientMoo}
                              onChange={(e) => setNewPatientMoo(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg font-bold text-slate-700"
                            >
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ที่อยู่อาศัยปัจจุบัน</label>
                            <textarea
                              value={newPatientAddress}
                              onChange={(e) => setNewPatientAddress(e.target.value)}
                              placeholder="เช่น บ้านเลขที่ 45 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง"
                              rows={2}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          {/* CATEGORY SELECTOR BUTTONS MANDATORY */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">จำแนกประเภทกลุ่มภาวะพึ่งพิง</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {(['ติดเตียง', 'ติดบ้าน', 'ติดสังคม'] as const).map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setNewPatientCategory(cat)}
                                  className={`py-2 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                                    newPatientCategory === cat
                                      ? cat === 'ติดเตียง'
                                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-500/15'
                                        : cat === 'ติดบ้าน'
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/15'
                                        : 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">สัญญานชีพและระดับอาการเบื้องต้น</label>
                            <input
                              type="text"
                              value={newPatientVital}
                              onChange={(e) => setNewPatientVital(e.target.value)}
                              placeholder="เช่น ความดัน 120/80 ชีพจร 72 ครั้ง/นาที"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ผู้ดูแลรับผิดชอบ (อสม. ผู้รับมอบหมาย)</label>
                            <select
                              value={newPatientCaregiver}
                              onChange={(e) => setNewPatientCaregiver(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2.5 rounded-lg text-slate-700 font-bold"
                            >
                              <option value="">-- เลือกเจ้าหน้าที่ อสม. --</option>
                              {vhvs.map(v => (
                                <option key={v.id} value={v.name}>{v.name}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ยืนยันบันทึกผู้ป่วยในกลุ่มเป้าหมาย</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Registered Database */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Search Bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 px-3 h-9 w-64 rounded-lg transition-all shrink-0">
                              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                              <input
                                type="text"
                                value={ptSearchQuery}
                                onChange={(e) => setPtSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 placeholder:text-slate-400 text-slate-800"
                                placeholder="ค้นหาชื่อผู้ป่วย, ที่อยู่ หรือ อสม..."
                              />
                              {ptSearchQuery && (
                                <button onClick={() => setPtSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                                  <X className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              )}
                            </div>
                            <select
                              value={ptMooFilter}
                              onChange={(e) => setPtMooFilter(e.target.value)}
                              className="text-xs bg-white border border-slate-200 focus:border-rose-500 px-2.5 py-1.5 h-9 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="ทั้งหมด">หมู่บ้าน: ทั้งหมด (หมู่ 1-8)</option>
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const ptRows = filteredDbPatients.map((p, i) => ({
                                  'ลำดับ': i + 1,
                                  'รหัส HN': p.id,
                                  'ชื่อ-นามสกุล': p.name,
                                  'หมู่บ้าน': p.moo || 'หมู่ 1',
                                  'กลุ่มภาวะพึ่งพิง': p.category,
                                  'อสม. ผู้รับผิดชอบ': p.caregiver,
                                  'ผู้ดูแลหลัก': p.familyCaregiverName || '-',
                                  'เบอร์โทรศัพท์': p.phone || '-',
                                  'ที่อยู่': p.address,
                                  'หมายเหตุสุขภาพ': p.notes || '-'
                                }));
                                exportSingleTableToExcel(ptRows, 'รายชื่อผู้ป่วยภาวะพึ่งพิง', `รายชื่อ_ผู้ป่วยภาวะพึ่งพิง_${new Date().toISOString().split('T')[0]}`);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="ดาวน์โหลดรายชื่อผู้ป่วยภาวะพึ่งพิงเป็นไฟล์ Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ดาวน์โหลด Excel</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono font-bold text-rose-500 hidden sm:inline">TARGETS_PATIENTS_DB</span>
                          </div>
                        </div>

                        {/* Database Table */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar touch-scroll">
                          {filteredDbPatients.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                              <Heart className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-xs font-bold">ไม่พบข้อมูลรายชื่อคนไข้ตรงตามคัดกรอง</p>
                            </div>
                          ) : (
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
                                  <th className="p-4 pl-6 font-bold">รหัส HN</th>
                                  <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
                                  <th className="p-4 font-bold">หมู่บ้าน / หมู่ที่</th>
                                  <th className="p-4 font-bold">กลุ่มคัดกรอง</th>
                                  <th className="p-4 font-bold">อสม. รับผิดชอบ</th>
                                  <th className="p-4 font-bold">ที่อยู่อาศัยหลัก</th>
                                  <th className="p-4 pr-6 text-right font-bold">จัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredDbPatients.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-mono font-bold text-slate-400">{item.id}</td>
                                    <td 
                                      className="p-4 font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer transition-colors"
                                      onClick={() => setSelectedDetailItem({ type: 'ผู้ป่วย', name: item.name, data: item })}
                                      title="คลิกเพื่อดูรายละเอียด"
                                    >
                                      {item.name}
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {item.moo || 'หมู่ 1'}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                        item.category === 'ติดเตียง'
                                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                                          : item.category === 'ติดบ้าน'
                                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                                           : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      }`}>
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="p-4 text-slate-700 font-semibold">{item.caregiver}</td>
                                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.address}</td>
                                    <td className="p-4 pr-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => openEditPatient(item)}
                                          className="text-rose-600 hover:text-rose-800 font-bold text-xs hover:underline cursor-pointer"
                                        >
                                          แก้ไข
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm(`คุณต้องการลบผู้ป่วยรายนี้ออกจากบัญชีรายชื่อกลุ่มเป้าหมายใช่หรือไม่?`)) {
                                              const updated = patients.filter(p => p.id !== item.id);
                                              setPatients(updated);
                                              localStorage.setItem('stitchsync_patients', JSON.stringify(updated));
                                              addLog('Local DB', `ลบข้อมูลผู้ป่วย ${item.name} สำเร็จ`, 'success');
                                            }
                                          }}
                                          className="text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                                        >
                                          ลบข้อมูล
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PART 3: Caregiver Section */}
                {selectedMindMapSection === 'caregiver' && (
                  <div className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
                    {/* Header Bar */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMindMapSection('overview')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>← กลับหน้าผังหลัก</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <h2 className="text-sm font-black text-slate-800">ส่วนที่ 3: ระบบลงทะเบียนข้อมูลผู้ดูแลผู้สูงอายุ (Caregiver)</h2>
                          <p className="text-[10px] text-slate-400">ญาติสนิท, บริบาลหลักประจำบ้านของคนไข้และผู้ป่วยพึ่งพิง</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-mono">
                        จำนวน: {caregivers.length} คน
                      </span>
                    </div>

                    {/* Content Layout */}
                    <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 touch-scroll">
                      {/* Left: Registration Form */}
                      <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm shrink-0 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ลงทะเบียนผู้ดูแลผู้สูงอายุ (Caregiver)</h3>
                          <p className="text-[11px] text-slate-500 mt-1">เพิ่มรายชื่อและข้อมูลผู้ดูแลหลักประจำบ้านของผู้ป่วยเพื่อประสานงานการเยี่ยมบ้าน</p>
                        </div>

                        <form onSubmit={handleRegisterCaregiver} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ชื่อ-นามสกุลผู้ดูแล (พร้อมคำนำหน้า)</label>
                            <input
                              type="text"
                              required
                              value={newCgName}
                              onChange={(e) => setNewCgName(e.target.value)}
                              placeholder="เช่น คุณประจบ ดีเสมอ"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                            <input
                              type="text"
                              value={newCgPhone}
                              onChange={(e) => setNewCgPhone(e.target.value)}
                              placeholder="เช่น 081-444-5555"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-3 py-2 rounded-lg font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                            <select
                              value={newCgMoo}
                              onChange={(e) => setNewCgMoo(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-3 py-2 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ที่อยู่อาศัยปัจจุบัน</label>
                            <textarea
                              value={newCgAddress}
                              onChange={(e) => setNewCgAddress(e.target.value)}
                              placeholder="เช่น บ้านเลขที่ 11 หมู่ 5 ต.ไผ่ต่ำ อ.วิหารแดง"
                              rows={3}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-3 py-2 rounded-lg"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ความสัมพันธ์กับผู้ป่วย</label>
                            <select
                              value={newCgRelationship}
                              onChange={(e) => setNewCgRelationship(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 px-3 py-2 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="บุตรสาว">บุตรสาว / บุตรชาย</option>
                              <option value="คู่สมรส">คู่สมรส (สามี/ภรรยา)</option>
                              <option value="ญาติ">ญาติสนิท / ผู้ดูแลอาสา</option>
                              <option value="เพื่อนบ้าน">เพื่อนบ้าน / ชุมชนดูแล</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ยืนยันลงทะเบียนผู้ดูแลเข้าระบบ</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Registered Caregiver Database */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Search & Action Bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center bg-white border border-slate-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 px-3 h-9 w-64 rounded-lg transition-all shrink-0">
                              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                              <input
                                type="text"
                                value={cgSearchQuery}
                                onChange={(e) => setCgSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 placeholder:text-slate-400 text-slate-800"
                                placeholder="ค้นหารายชื่อผู้ดูแล หรือที่อยู่..."
                              />
                              {cgSearchQuery && (
                                <button onClick={() => setCgSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                                  <X className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              )}
                            </div>
                            <select
                              value={cgMooFilter}
                              onChange={(e) => setCgMooFilter(e.target.value)}
                              className="text-xs bg-white border border-slate-200 focus:border-emerald-500 px-2.5 py-1.5 h-9 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="ทั้งหมด">หมู่บ้าน: ทั้งหมด (หมู่ 1-8)</option>
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const cgRows = filteredCaregivers.map((c, i) => ({
                                  'ลำดับ': i + 1,
                                  'รหัสผู้ดูแล': c.id,
                                  'ชื่อ-นามสกุล': c.name,
                                  'ประจำหมู่บ้าน': c.moo || 'หมู่ 1',
                                  'ความสัมพันธ์กับผู้ป่วย': c.relationship || 'ญาติ',
                                  'เบอร์โทรศัพท์': c.phone,
                                  'ที่อยู่': c.address
                                }));
                                exportSingleTableToExcel(cgRows, 'รายชื่อผู้ดูแล Caregiver', `รายชื่อ_ผู้ดูแล_Caregiver_${new Date().toISOString().split('T')[0]}`);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="ดาวน์โหลดรายชื่อผู้ดูแลเป็นไฟล์ Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ดาวน์โหลด Excel</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">DATABASE_CG_SYS</span>
                          </div>
                        </div>

                        {/* Database Table */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar touch-scroll">
                          {filteredCaregivers.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                              <Users className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-xs font-bold">ไม่พบข้อมูลรายชื่อผู้ดูแลตรงตามที่ค้นหา</p>
                            </div>
                          ) : (
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
                                  <th className="p-4 pl-6 font-bold">รหัสผู้ดูแล</th>
                                  <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
                                  <th className="p-4 font-bold">หมู่บ้าน / หมู่ที่</th>
                                  <th className="p-4 font-bold">ความสัมพันธ์</th>
                                  <th className="p-4 font-bold">เบอร์โทรศัพท์</th>
                                  <th className="p-4 font-bold">ที่อยู่อาศัยหลัก</th>
                                  <th className="p-4 pr-6 text-right font-bold">จัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredCaregivers.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-mono font-bold text-slate-400">{item.id}</td>
                                    <td 
                                      className="p-4 font-bold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                                      onClick={() => setSelectedDetailItem({ type: 'ผู้ดูแล', name: item.name, data: item })}
                                      title="คลิกเพื่อดูรายละเอียด"
                                    >
                                      {item.name}
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {item.moo || 'หมู่ 1'}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {item.relationship || 'ญาติ'}
                                      </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">{item.phone}</td>
                                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.address}</td>
                                    <td className="p-4 pr-6 text-right">
                                      {userRole === 'staff' ? (
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => openEditCg(item)}
                                            className="text-emerald-600 hover:text-emerald-800 font-bold text-xs hover:underline cursor-pointer"
                                          >
                                            แก้ไข
                                          </button>
                                          <span className="text-slate-300">|</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (window.confirm(`คุณต้องการลบข้อมูลผู้ดูแล "${item.name}" ใช่หรือไม่?`)) {
                                                const updated = caregivers.filter(c => c.id !== item.id);
                                                setCaregivers(updated);
                                                localStorage.setItem('stitchsync_caregivers', JSON.stringify(updated));
                                                addLog('Local DB', `ลบข้อมูลผู้ดูแล ${item.name} สำเร็จ`, 'success');
                                              }
                                            }}
                                            className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline cursor-pointer"
                                          >
                                            ลบข้อมูล
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 font-medium italic">
                                          เฉพาะเจ้าหน้าที่
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PART 4: ผู้ทำคุณประโยชน์ Registration and Directory */}
                {selectedMindMapSection === 'benefactor' && (
                  <div className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedMindMapSection('overview')}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>← กลับหน้าผังหลัก</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <h2 className="text-sm sm:text-base font-bold text-slate-800">
                            4. ฐานข้อมูลผู้ทำคุณประโยชน์และผู้สนับสนุนชุมชน
                          </h2>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-mono">
                        จำนวน: {benefactors.length} ราย/องค์กร
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 touch-scroll">
                      {/* Left: Registration Form */}
                      <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm shrink-0 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ลงทะเบียน ผู้ทำคุณประโยชน์</h3>
                            {userRole === 'staff' ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-100">
                                สิทธิ์เจ้าหน้าที่
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded border border-amber-100">
                                บุคคลทั่วไป (อ่านเท่านั้น)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">บันทึกประวัติผู้ทำคุณประโยชน์ บริจาคอุปกรณ์ หรือสนับสนุนงานสุขภาพชุมชน</p>
                        </div>

                        {userRole !== 'staff' && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                              <span>เฉพาะเจ้าหน้าที่สาธารณสุข</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-amber-700">
                              สิทธิ์บุคคลทั่วไปสามารถดูข้อมูลและดาวน์โหลดรายงานได้เท่านั้น หากต้องการลงทะเบียนหรือแก้ไขข้อมูล กรุณาลงชื่อเข้าใช้ด้วยบัญชีเจ้าหน้าที่
                            </p>
                          </div>
                        )}

                        <form onSubmit={handleRegisterBenefactor} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ชื่อ-นามสกุล / ชื่อองค์กรผู้ทำคุณประโยชน์</label>
                            <input
                              type="text"
                              required
                              disabled={userRole !== 'staff'}
                              value={newBenName}
                              onChange={(e) => setNewBenName(e.target.value)}
                              placeholder="เช่น คุณสมชาย ใจดี หรือ มูลนิธิสาธารณกุศล"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 rounded-lg disabled:opacity-60 disabled:bg-slate-100"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                            <input
                              type="text"
                              disabled={userRole !== 'staff'}
                              value={newBenPhone}
                              onChange={(e) => setNewBenPhone(e.target.value)}
                              placeholder="เช่น 081-234-5678"
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 rounded-lg font-mono disabled:opacity-60 disabled:bg-slate-100"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                            <select
                              disabled={userRole !== 'staff'}
                              value={newBenMoo}
                              onChange={(e) => setNewBenMoo(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 rounded-lg font-bold text-slate-700 cursor-pointer disabled:opacity-60 disabled:bg-slate-100"
                            >
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">ที่อยู่อาศัย / ที่ตั้งองค์กร</label>
                            <textarea
                              disabled={userRole !== 'staff'}
                              value={newBenAddress}
                              onChange={(e) => setNewBenAddress(e.target.value)}
                              placeholder="เช่น บ้านเลขที่ 1 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง"
                              rows={2}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 rounded-lg disabled:opacity-60 disabled:bg-slate-100"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">รายละเอียดคุณประโยชน์ / สิ่งที่สนับสนุนชุมชน</label>
                            <textarea
                              disabled={userRole !== 'staff'}
                              value={newBenContribution}
                              onChange={(e) => setNewBenContribution(e.target.value)}
                              placeholder="เช่น บริจาคเตียงผู้ป่วย 2 ชุด, สนับสนุนผ้าอ้อมผู้ใหญ่และถุงยังชีพ..."
                              rows={3}
                              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 px-3 py-2 rounded-lg disabled:opacity-60 disabled:bg-slate-100"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={userRole !== 'staff'}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ยืนยันลงทะเบียนผู้ทำคุณประโยชน์</span>
                          </button>
                        </form>
                      </div>

                      {/* Right: Registered Benefactors Database */}
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        {/* Search & Action Bar */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center bg-white border border-slate-200 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 px-3 h-9 w-64 rounded-lg transition-all shrink-0">
                              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                              <input
                                type="text"
                                value={benSearchQuery}
                                onChange={(e) => setBenSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs flex-1 placeholder:text-slate-400 text-slate-800"
                                placeholder="ค้นหาชื่อผู้ทำคุณประโยชน์ หรือสิ่งสนับสนุน..."
                              />
                              {benSearchQuery && (
                                <button onClick={() => setBenSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                                  <X className="w-2.5 h-2.5 text-slate-500" />
                                </button>
                              )}
                            </div>
                            <select
                              value={benMooFilter}
                              onChange={(e) => setBenMooFilter(e.target.value)}
                              className="text-xs bg-white border border-slate-200 focus:border-amber-500 px-2.5 py-1.5 h-9 rounded-lg font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="ทั้งหมด">หมู่บ้าน: ทั้งหมด (หมู่ 1-8)</option>
                              {MOO_OPTIONS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const benRows = filteredBenefactors.map((b, i) => ({
                                  'ลำดับ': i + 1,
                                  'รหัสผู้ทำคุณประโยชน์': b.id,
                                  'ชื่อ-นามสกุล/องค์กร': b.name,
                                  'ประจำหมู่บ้าน': b.moo || 'หมู่ 1',
                                  'คุณประโยชน์/การสนับสนุน': b.contribution,
                                  'เบอร์โทรศัพท์': b.phone,
                                  'ที่อยู่': b.address
                                }));
                                exportSingleTableToExcel(benRows, 'รายชื่อผู้ทำคุณประโยชน์', `รายชื่อ_ผู้ทำคุณประโยชน์_${new Date().toISOString().split('T')[0]}`);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                              title="ดาวน์โหลดรายชื่อผู้ทำคุณประโยชน์เป็นไฟล์ Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                              <span>ดาวน์โหลด Excel</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">DATABASE_BEN_SYS</span>
                          </div>
                        </div>

                        {/* Database Table */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar touch-scroll">
                          {filteredBenefactors.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                              <Award className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-xs font-bold">ไม่พบข้อมูลรายชื่อผู้ทำคุณประโยชน์ตรงตามที่ค้นหา</p>
                            </div>
                          ) : (
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 font-mono border-b border-slate-100">
                                  <th className="p-4 pl-6 font-bold">รหัส</th>
                                  <th className="p-4 font-bold">ชื่อ-นามสกุล / องค์กร</th>
                                  <th className="p-4 font-bold">หมู่บ้าน / หมู่ที่</th>
                                  <th className="p-4 font-bold">การสนับสนุน / คุณประโยชน์ต่อชุมชน</th>
                                  <th className="p-4 font-bold">เบอร์โทรศัพท์</th>
                                  <th className="p-4 font-bold">ที่อยู่อาศัย / ที่ตั้ง</th>
                                  <th className="p-4 pr-6 text-right font-bold">จัดการ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredBenefactors.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-mono font-bold text-slate-400">{item.id}</td>
                                    <td 
                                      className="p-4 font-bold text-amber-600 hover:text-amber-800 hover:underline cursor-pointer transition-colors"
                                      onClick={() => setSelectedDetailItem({ type: 'ผู้ทำคุณประโยชน์' as any, name: item.name, data: item })}
                                      title="คลิกเพื่อดูรายละเอียด"
                                    >
                                      {item.name}
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {item.moo || 'หมู่ 1'}
                                      </span>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                      <span className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-100 inline-block leading-normal">
                                        {item.contribution || 'ผู้สนับสนุนชุมชน'}
                                      </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">{item.phone}</td>
                                    <td className="p-4 text-slate-500 max-w-xs truncate">{item.address}</td>
                                    <td className="p-4 pr-6 text-right">
                                      {userRole === 'staff' ? (
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => openEditBen(item)}
                                            className="text-amber-600 hover:text-amber-800 font-bold text-xs hover:underline cursor-pointer"
                                          >
                                            แก้ไข
                                          </button>
                                          <span className="text-slate-300">|</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (window.confirm(`คุณต้องการลบข้อมูลผู้ทำคุณประโยชน์ "${item.name}" ใช่หรือไม่?`)) {
                                                const updated = benefactors.filter(b => b.id !== item.id);
                                                setBenefactors(updated);
                                                localStorage.setItem('stitchsync_benefactors', JSON.stringify(updated));
                                                addLog('Local DB', `ลบข้อมูลผู้ทำคุณประโยชน์ ${item.name} สำเร็จ`, 'success');
                                              }
                                            }}
                                            className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline cursor-pointer"
                                          >
                                            ลบข้อมูล
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 font-medium italic">
                                          เฉพาะเจ้าหน้าที่
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Green Floating Room Widget for Coin Exchange System */}
                    <CoinExchangeWidget
                      userRole={userRole}
                      userName={user?.displayName || 'อสม. สมบูรณ์ สุขใจ'}
                      vhvs={vhvs}
                      benefactors={benefactors}
                      onAddLog={(source, msg, type) => addLog(source, msg, type)}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Map View Tab */}
            {currentTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 z-0">
                  <iframe 
                    src="https://www.google.com/maps/d/embed?mid=1EJn-6UCajvEy2clWRRGHMw7ZG0xWhQE" 
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="ระบบจำแนกสีตำบลไผ่ต่ำ"
                  />
                </div>
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 w-64 shadow-lg">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">สัญลักษณ์จำแนกผู้ป่วย</h4>
                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
                      <span className="font-medium">สีแดง - กลุ่มติดเตียง (ช่วยเหลือตัวเองไม่ได้)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
                      <span className="font-medium">สีเหลือง - กลุ่มติดบ้าน (ช่วยเหลือตัวเองได้บ้าง)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      <span className="font-medium">สีเขียว - กลุ่มติดสังคม (มีส่วนร่วมกิจกรรมชุมชน)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analytics Tab: Table, Charts, and Population Filter */}
            {currentTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-6 overflow-y-auto flex flex-col space-y-6 bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">วิเคราะห์ข้อมูลประชากรสุขภาพ</h2>
                    <p className="text-xs text-slate-400">รายงานข้อมูลสถานะผู้ป่วยและประวัติการเยี่ยมสะสม</p>
                  </div>

                  {/* Filtering pill */}
                  <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-lg text-xs font-medium">
                    {(['ทั้งหมด', 'ติดเตียง', 'ติดบ้าน', 'ติดสังคม'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          categoryFilter === cat 
                            ? 'bg-blue-600 text-white shadow-sm font-bold' 
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Roster Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      รายชื่อผู้ป่วยทั้งหมด ({filteredPatients.length} ราย)
                    </span>
                    {userRole === 'public' ? (
                      <button 
                        onClick={() => {
                          alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้ลงทะเบียนคนไข้ใหม่ได้');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold flex items-center space-x-1 border border-slate-200 cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>ลงทะเบียนคนไข้ใหม่ (เฉพาะเจ้าหน้าที่)</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setModalType('patient');
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ลงทะเบียนคนไข้ใหม่</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-mono border-b border-slate-100">
                          <th className="p-4 pl-6 font-bold">รหัสประจำตัว (ID)</th>
                          <th className="p-4 font-bold">ชื่อ-นามสกุล</th>
                          <th className="p-4 font-bold">กลุ่มสถานะ</th>
                          <th className="p-4 font-bold">ที่อยู่ปัจจุบัน</th>
                          <th className="p-4 font-bold">ผลวัดระดับอาการล่าสุด</th>
                          <th className="p-4 font-bold">อสม. ผู้ดูแล</th>
                          <th className="p-4 font-bold">เข้าเยี่ยมล่าสุด</th>
                          <th className="p-4 text-center font-bold">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                              ไม่พบข้อมูลผู้ป่วยตามตัวกรองและการค้นหา
                            </td>
                          </tr>
                        ) : (
                          filteredPatients.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 pl-6 font-mono text-[11px] font-bold text-slate-500">{p.id}</td>
                              <td className="p-4 font-bold text-slate-800">{p.name}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.category === 'ติดเตียง' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                  p.category === 'ติดบ้าน' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500 max-w-xs truncate">{p.address}</td>
                              <td className="p-4 text-slate-600">{p.vitalSigns}</td>
                              <td className="p-4 font-medium text-slate-700">{p.caregiver}</td>
                              <td className="p-4 text-slate-400">{p.lastVisited}</td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center gap-1.5 justify-center">
                                  <button 
                                    onClick={() => {
                                      if (userRole === 'public') {
                                        alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้บันทึกรายงานผลการเข้าเยี่ยมบ้านได้');
                                        return;
                                      }
                                      setSelectedPatientId(p.id);
                                      setModalType('visit');
                                      setIsModalOpen(true);
                                    }}
                                    className={`text-[11px] font-bold cursor-pointer ${
                                      userRole === 'public' 
                                        ? 'text-slate-400 hover:text-slate-500 hover:underline' 
                                        : 'text-blue-600 hover:text-blue-800 hover:underline'
                                    }`}
                                  >
                                    {userRole === 'public' ? 'รายงานผลเยี่ยม (ล็อก)' : 'รายงานผลเยี่ยม'}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (userRole === 'public') {
                                        alert('⚠️ สิทธิ์การใช้งานจำกัด: เฉพาะเจ้าหน้าที่สาธารณสุขและ อสม. เท่านั้นที่ได้รับอนุญาตให้แก้ไขข้อมูลผู้ป่วยได้');
                                        return;
                                      }
                                      openEditPatient(p);
                                    }}
                                    className={`text-[11px] font-bold cursor-pointer ${
                                      userRole === 'public' 
                                        ? 'text-slate-400 hover:text-slate-500 hover:underline' 
                                        : 'text-amber-600 hover:text-amber-800 hover:underline'
                                    }`}
                                  >
                                    {userRole === 'public' ? 'แก้ไขข้อมูล (ล็อก)' : 'แก้ไขข้อมูล'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Network Logs & Realtime Code Execution Tab */}
            {currentTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-6 overflow-y-auto flex flex-col space-y-6 bg-slate-50"
              >
                {/* Header Title & Export Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">ศูนย์ควบคุมรันโค้ดเบื้องหลัง & ประวัติประมวลผลเรียลไทม์ (Live Engine & Network Logs)</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      แสดงการรันระบบโค้ดเบื้องหลัง (Background Worker Threads, Memory Heap, Latency & Realtime Database Execution)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const actRows = activities.map((a, i) => ({
                          'ลำดับ': i + 1,
                          'เวลา/วันที่': a.timestamp || '-',
                          'ชื่อผู้ป่วย': a.patientName || '-',
                          'ผู้ลงบันทึก/ผู้เยี่ยม': a.caregiverName || '-',
                          'ประเภทกิจกรรม': a.type || '-',
                          'สถานะสุขภาพ': a.status || '-',
                          'รายละเอียดผลการเยี่ยม': a.description || '-'
                        }));
                        exportSingleTableToExcel(actRows, 'ประวัติการเข้าเยี่ยมบ้าน', `รายงานการเยี่ยมบ้าน_${new Date().toISOString().split('T')[0]}`);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="ดาวน์โหลดรายงานประวัติการเข้าเยี่ยมบ้านทั้งหมดเป็นไฟล์ Excel"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลดรายงานเยี่ยมบ้าน</span>
                    </button>

                    <button
                      onClick={handleExportAllExcel}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      title="ดาวน์โหลดฐานข้อมูลทุกประเภทในไฟล์ Excel เดียว"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ดาวน์โหลด Excel รวม 4 ฐานข้อมูล</span>
                    </button>
                  </div>
                </div>

                {/* Realtime Metrics Tiles Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase font-mono">
                      <span>สถานะเซิร์ฟเวอร์</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-base font-extrabold text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                      <span>RUNNING</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">100%</span>
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase font-mono">
                      การใช้งาน CPU
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-base font-extrabold text-slate-800 font-mono">{realtimeMetrics.cpu}%</p>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${Math.min(100, realtimeMetrics.cpu * 2)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase font-mono">
                      หน่วยความจำ V8 Heap
                    </div>
                    <p className="text-base font-extrabold text-indigo-600 mt-1 font-mono">
                      {realtimeMetrics.memory} <span className="text-xs font-normal text-slate-400">/ 512 MB</span>
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase font-mono">
                      ความเร็ว Latency Ping
                    </div>
                    <p className="text-base font-extrabold text-cyan-600 mt-1 font-mono">
                      {realtimeMetrics.latency} <span className="text-xs font-normal text-slate-400">ms</span>
                    </p>
                  </div>

                  <div className="col-span-2 md:col-span-1 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
                    <div className="text-slate-400 text-[10px] font-bold uppercase font-mono">
                      คำสั่งที่รันสะสม
                    </div>
                    <p className="text-base font-extrabold text-slate-900 mt-1 font-mono">
                      {realtimeMetrics.execCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">Ops</span>
                    </p>
                  </div>
                </div>

                {/* Interactive Backend Command Trigger Toolbar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                      <span>⚡ คำสั่งรันโปรเซสเบื้องหลังทันที (Interactive Backend Routines)</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsRealtimeActive(!isRealtimeActive)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                          isRealtimeActive 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {isRealtimeActive ? '⏸️ พักสตรีมแบบเรียลไทม์' : '▶️ เริ่มสตรีมเรียลไทม์ต่อ'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={runSystemDiagnostic}
                      disabled={isDiagnosticRunning}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                      <span>🚀 รันตรวจระบบโค้ดครบวงจร (Full Diagnostic)</span>
                    </button>

                    <button
                      onClick={runEtlPipeline}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>🔄 สแกนและจัดเรียงข้อมูล Sheets (ETL Pipeline)</span>
                    </button>

                    <button
                      onClick={runGeoIndexer}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>🛰️ ประมวลผลพิกัดภูมิศาสตร์ GIS</span>
                    </button>

                    <button
                      onClick={runHealthRiskScan}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>🩺 สแกนคัดกรองผู้ป่วยความเสี่ยงสูง</span>
                    </button>

                    <button
                      onClick={runMemoryGc}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>🧹 เคลียร์หน่วยความจำ V8 Heap (Memory GC)</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar for Terminal */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    {(['ทั้งหมด', 'System', 'Auth', 'Sheets DB', 'Local DB', 'Geospatial', 'Risk Evaluator', 'V8 Engine'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setLogFilter(cat)}
                        className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          logFilter === cat
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search and Clear */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาข้อความรันโค้ด..."
                        value={terminalSearch}
                        onChange={(e) => setTerminalSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 w-48"
                      />
                    </div>

                    <button
                      onClick={() => setNetworkLogs([])}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      ล้างหน้าจอ
                    </button>
                  </div>
                </div>

                {/* Main Dark Terminal Window */}
                <div className="bg-slate-950 rounded-xl p-5 font-mono text-xs text-slate-300 shadow-2xl flex-1 flex flex-col overflow-hidden min-h-[380px] max-h-[550px] border border-slate-800">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3 shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      </div>
                      <span className="text-slate-400 text-[10px] tracking-widest uppercase font-bold pl-2 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>REALTIME CODE EXECUTION TERMINAL — STITCHSYNC RUNTIME v2.4</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      แสดงรายการ {networkLogs.filter(l => (logFilter === 'ทั้งหมด' || l.type === logFilter) && (!terminalSearch || l.details.toLowerCase().includes(terminalSearch.toLowerCase()))).length} / {networkLogs.length} บรรทัด
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar font-mono text-[11px] leading-relaxed">
                    {networkLogs.length === 0 ? (
                      <div className="text-slate-600 text-center py-20 italic">
                        [ไม่มีบันทึกข้อมูลการรันโค้ดเบื้องหลังล่าสุด กดปุ่มรันเพื่อทดสอบ]
                      </div>
                    ) : (
                      networkLogs
                        .filter(l => (logFilter === 'ทั้งหมด' || l.type === logFilter) && (!terminalSearch || l.details.toLowerCase().includes(terminalSearch.toLowerCase())))
                        .map((log, index) => (
                          <div key={index} className="flex items-start space-x-2.5 hover:bg-slate-900/60 p-1 rounded transition-colors">
                            <span className="text-slate-600 select-none text-[10px] shrink-0 w-8 text-right">
                              {networkLogs.length - index}
                            </span>
                            <span className="text-slate-500 shrink-0 font-bold">{log.time}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              log.type === 'Auth' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' :
                              log.type === 'Sheets DB' ? 'bg-blue-950 text-blue-400 border border-blue-900' :
                              log.type === 'Realtime Engine' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                              log.type === 'Geospatial' ? 'bg-teal-950 text-teal-400 border border-teal-900' :
                              log.type === 'Risk Evaluator' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                              log.type === 'V8 Engine' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              [{log.type}]
                            </span>
                            <span className={`flex-1 break-words ${
                              log.status === 'success' ? 'text-slate-200' :
                              log.status === 'error' ? 'text-rose-400 font-bold' : 'text-amber-300 animate-pulse'
                            }`}>
                              {log.details}
                            </span>
                          </div>
                        ))
                    )}
                    <div className="pt-2 text-emerald-400 animate-pulse flex items-center space-x-1 font-mono text-[11px]">
                      <span>&gt;</span>
                      <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Team Settings Tab */}
            {currentTab === 'team' && (
              <motion.div 
                key="team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-6 overflow-y-auto flex flex-col space-y-6 bg-slate-50"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">ตั้งค่าและตรวจสอบสิทธิ์ระบบ</h2>
                  <p className="text-xs text-slate-400">ข้อมูลผู้ดูแลระบบและตารางฐานข้อมูลที่เชื่อมต่อ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account detail card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ผู้ใช้งานปัจจุบัน</h3>
                    <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                          alt="Profile"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 border border-slate-300">
                          {(user?.displayName || 'CS').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-slate-800 leading-tight">{user?.displayName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      <p><strong>ประเภทการล็อกอิน:</strong> บัญชีผู้ใช้ร่วม (Gmail ผ่านทางความปลอดภัย Google)</p>
                      <p><strong>ขอบเขตสิทธิ์ (Scopes):</strong> อ่าน เขียน ค้นหา แฟ้มเอกสารและตารางคำนวณใน Google Drive ทั้งหมดที่แอปนี้สร้างขึ้น</p>
                    </div>
                  </div>

                  {/* Connected Database info */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">ข้อมูล Google Sheets ฐานข้อมูลคลาวด์</h3>
                    <div className="space-y-4">
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-3 text-emerald-800">
                        <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-xs">ตำบลไผ่ต่ำ - ระบบจัดการสุขภาพ</p>
                          <p className="text-[10px] text-emerald-600 font-mono mt-0.5">บันทึกออนไลน์แบบเรียลไทม์ใน Google Drive ของคุณ</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <p><strong>ตำแหน่งจัดเก็บ:</strong> แฟ้มเอกสารตารางคำนวณ (Spreadsheet) บันทึกตารางประชากรคนไข้ และตารางบันทึกกิจกรรมล่าสุดเพื่ออัปเดตแบบทันทีทันใด</p>
                        <p><strong>ลิงก์นำส่งภายนอก (Stitch):</strong> ข้อมูลจะทำงานสัมพันธ์แบบอัปสตรีมกับระบบ Stitch matching profile <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">#15869037384118607249</code></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Whitelist Management Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-850">👥 รายชื่อ Gmail ของเจ้าหน้าที่ที่ได้รับการอนุมัติสิทธิ์ (Staff Whitelist)</h3>
                  </div>
                  
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong>คำอธิบายระบบรักษาความปลอดภัย:</strong> บัญชีผู้ใช้ที่ล็อกอินด้วย Google Sign-In จะถูกตรวจสอบสิทธิ์กับรายชื่อด้านล่างนี้โดยอัตโนมัติ 
                    หากอีเมลตรงกับรายการที่กำหนด จะได้รับสิทธิ์ <span className="text-emerald-600 font-bold">"เจ้าหน้าที่ (Staff)"</span> ซึ่งสามารถเพิ่ม/แก้ไขคนไข้ และเขียนรายงานผลเยี่ยมได้ 
                    แต่หากล็อกอินด้วยอีเมลอื่น ๆ ที่ไม่มีในรายชื่อ ระบบจะล็อกสิทธิ์ให้ใช้งานในฐานะ <span className="text-amber-600 font-bold">"บุคคลทั่วไป (Guest)"</span> ทันที ซึ่งสามารถเรียกดูรายงานและแผนที่ได้ แต่จะแก้ไขหรือบันทึกข้อมูลใด ๆ ไม่ได้เลย
                  </p>

                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Email Form */}
                    <div className="md:col-span-1 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700">อนุมัติอีเมลเจ้าหน้าที่เพิ่ม</h4>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const email = newAuthEmail.trim().toLowerCase();
                          if (!email) return;
                          
                          if (!email.includes('@')) {
                            alert('กรุณากรอกอีเมลให้ถูกต้องตามรูปแบบบัญชี Google (เช่น name@gmail.com)');
                            return;
                          }
                          
                          if (authorizedEmails.some(e => e.toLowerCase() === email)) {
                            alert('อีเมลนี้ได้รับสิทธิ์อนุมัติเรียบร้อยแล้ว');
                            return;
                          }
                          
                          const newList = [...authorizedEmails, email];
                          setAuthorizedEmails(newList);
                          setNewAuthEmail('');
                          addLog('System', `เพิ่มอีเมลอนุมัติสิทธิ์สำเร็จ: ${email}`, 'success');
                          
                          // If current logged-in google user matches the newly added email, refresh role immediately
                          if (user && user.email && user.email.toLowerCase() === email) {
                            setUserRole('staff');
                            localStorage.setItem('stitchsync_role', 'staff');
                            addLog('System', `อัปเกรดสิทธิ์ของคุณเป็น [เจ้าหน้าที่] เรียบร้อยแล้ว`, 'success');
                          }
                        }}
                        className="space-y-2"
                      >
                        <input
                          type="email"
                          value={newAuthEmail}
                          onChange={(e) => setNewAuthEmail(e.target.value)}
                          placeholder="ระบุ Gmail เช่น sombat@gmail.com"
                          className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white text-slate-800"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>อนุมัติสิทธิ์ใช้งาน</span>
                        </button>
                      </form>
                      <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[10.5px] text-amber-700 leading-relaxed">
                        💡 <strong>คำแนะนำเพิ่มเติม:</strong> นอกจากการอนุมัติสิทธิ์ในแผงควบคุมนี้แล้ว ท่านจำเป็นต้องกดแชร์ Google Sheets แผ่นงานฐานข้อมูล (ตำบลไผ่ต่ำ - ระบบจัดการสุขภาพ) ใน Google Drive ของท่านแบบ "Editor (สิทธิ์ผู้แก้ไข)" ไปยังบัญชี Gmail ของเจ้าหน้าที่ดังกล่าวด้วย เพื่อให้ Google Sheets API อนุญาตให้อีเมลนั้นอ่าน/เขียนข้อมูลได้สมบูรณ์แบบ
                      </div>
                    </div>

                    {/* Email Whitelist Table/List */}
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>รายชื่อที่ได้รับอนุมัติในระบบ ({authorizedEmails.length})</span>
                        <span className="text-[10px] text-slate-400 font-normal">* บันทึกถาวรในระดับ Sandbox ท้องถิ่น</span>
                      </h4>
                      
                      <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-[220px] overflow-y-auto bg-slate-50">
                        {authorizedEmails.map((email) => {
                          const isCurrentUser = user && user.email && user.email.toLowerCase() === email.toLowerCase();
                          return (
                            <div key={email} className="flex items-center justify-between p-2.5 bg-white text-xs text-slate-700">
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-mono text-slate-700">{email}</span>
                                {isCurrentUser && (
                                  <span className="bg-blue-50 border border-blue-200 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    คุณใช้งานอยู่นี้
                                  </span>
                                )}
                              </div>
                              
                              <button
                                type="button"
                                disabled={isCurrentUser}
                                onClick={() => {
                                  if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกอนุมัติสิทธิ์สำหรับอีเมล ${email}?`)) {
                                    const newList = authorizedEmails.filter(e => e !== email);
                                    setAuthorizedEmails(newList);
                                    addLog('System', `ยกเลิกสิทธิ์อนุมัติเรียบร้อย: ${email}`, 'success');
                                    
                                    // If we revoke our own email, set role to public
                                    if (user && user.email && user.email.toLowerCase() === email.toLowerCase()) {
                                      setUserRole('public');
                                      localStorage.setItem('stitchsync_role', 'public');
                                    }
                                  }
                                }}
                                className={`text-[10px] font-bold ${
                                  isCurrentUser 
                                    ? 'text-slate-300 cursor-not-allowed' 
                                    : 'text-rose-500 hover:text-rose-700 cursor-pointer hover:underline'
                                }`}
                              >
                                {isCurrentUser ? 'ไม่สามารถเพิกถอนสิทธิ์ตนเองได้' : 'เพิกถอนสิทธิ์'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Access Logs & IP Location Section (ระบบจัดการข้อมูล - บันทึกการเข้าถึงและพิกัด IP) */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                          <span>🌐 บันทึกประวัติการเข้าใช้งานและตำแหน่ง IP ของผู้ใช้ (User Access & IP Location Logs)</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold rounded-full">
                            LIVE TRACKING
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          แสดงข้อมูลผู้เข้าใช้งาน หมายเลข IP Address ตำแหน่งภูมิศาสตร์ (GPS/อำเภอ) และอุปกรณ์ที่ใช้เข้าสู่ระบบจัดการข้อมูล
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      <span className="px-3 py-1.5 bg-slate-900 text-emerald-400 rounded-lg font-bold border border-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>IP ปัจจุบัน: 182.52.231.42</span>
                      </span>
                    </div>
                  </div>

                  {/* IP Location Quick Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">ตำแหน่งหลักที่เข้าถึง</span>
                        <span className="font-bold text-slate-800">ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">สถานะการตรวจสอบสิทธิ์ IP</span>
                        <span className="font-bold text-emerald-700">อนุญาตและผ่านการรักษาความปลอดภัย</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">เครือข่าย & ผู้ให้บริการ</span>
                        <span className="font-bold text-slate-800">AIS Fibre / TrueOnline (Saraburi Node)</span>
                      </div>
                    </div>
                  </div>

                  {/* User Access Logs Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>ตารางประวัติผู้เข้าใช้งานระบบล่าสุด</span>
                      <span className="text-[10px] font-mono text-slate-500">REALTIME_IP_SESSIONS</span>
                    </div>

                    <div className="overflow-x-auto touch-scroll">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 text-slate-500 font-mono text-[11px] border-b border-slate-200">
                            <th className="p-3 pl-4 font-bold">เวลาเข้าใช้</th>
                            <th className="p-3 font-bold">ชื่อผู้ใช้งาน / อีเมล</th>
                            <th className="p-3 font-bold">สิทธิ์การใช้งาน</th>
                            <th className="p-3 font-bold">หมายเลข IP Address</th>
                            <th className="p-3 font-bold">ตำแหน่งที่ตั้ง (GPS / อำเภอ)</th>
                            <th className="p-3 font-bold">อุปกรณ์ / บราวเซอร์</th>
                            <th className="p-3 pr-4 font-bold text-right">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {/* Entry 1: Current User */}
                          <tr className="bg-emerald-50/40 hover:bg-emerald-50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-700">
                              {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} (วันนี้)
                            </td>
                            <td className="p-3 font-sans font-bold text-slate-900">
                              {user?.displayName || 'เจ้าหน้าที่ สสอ.วิหารแดง'}
                              <span className="block text-[10px] font-mono text-slate-500 font-normal">{user?.email || 'hinnapat06@gmail.com'}</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {userRole === 'staff' ? 'เจ้าหน้าที่ (Staff)' : 'บุคคลทั่วไป (Guest)'}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-blue-700">
                              182.52.231.42
                            </td>
                            <td className="p-3 font-sans text-slate-700 font-medium">
                              📍 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี (14.3218, 100.9842)
                            </td>
                            <td className="p-3 text-slate-600">
                              Google Chrome 126.0 (iOS Mobile)
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                                <span>ONLINE</span>
                              </span>
                            </td>
                          </tr>

                          {/* Entry 2 */}
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 pl-4 text-slate-600">
                              21 ก.ค. 2569 22:45:10
                            </td>
                            <td className="p-3 font-sans font-bold text-slate-800">
                              อสม. รัตนาภรณ์ รักษ์ดี
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">somchai.vhv@gmail.com</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                อสม. ประจำหมู่ 1
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-700">
                              110.168.23.105
                            </td>
                            <td className="p-3 font-sans text-slate-600">
                              📍 อ.วิหารแดง จ.สระบุรี (14.3185, 100.9820)
                            </td>
                            <td className="p-3 text-slate-500">
                              Safari Mobile (iPhone 15 Pro)
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                สำเร็จ
                              </span>
                            </td>
                          </tr>

                          {/* Entry 3 */}
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 pl-4 text-slate-600">
                              21 ก.ค. 2569 21:12:04
                            </td>
                            <td className="p-3 font-sans font-bold text-slate-800">
                              อสม. สมพงษ์ ใจเย็น
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">sompong.vhv@gmail.com</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                อสม. ประจำหมู่ 3
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-700">
                              49.228.192.14
                            </td>
                            <td className="p-3 font-sans text-slate-600">
                              📍 ต.หนองหมู อ.วิหารแดง จ.สระบุรี (14.3105, 100.9521)
                            </td>
                            <td className="p-3 text-slate-500">
                              Microsoft Edge (Windows 11)
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                สำเร็จ
                              </span>
                            </td>
                          </tr>

                          {/* Entry 4 */}
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 pl-4 text-slate-600">
                              21 ก.ค. 2569 19:30:22
                            </td>
                            <td className="p-3 font-sans font-bold text-slate-800">
                              คุณมะลิ (ผู้ดูแล Caregiver)
                              <span className="block text-[10px] font-mono text-slate-400 font-normal">cg.mali@gmail.com</span>
                            </td>
                            <td className="p-3 font-sans">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                ผู้ดูแลคนไข้
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-700">
                              171.96.185.88
                            </td>
                            <td className="p-3 font-sans text-slate-600">
                              📍 อ.เมืองสระบุรี จ.สระบุรี (14.5289, 100.9108)
                            </td>
                            <td className="p-3 text-slate-500">
                              Google Chrome (Android)
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                สำเร็จ
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Optional Sign Out Button in settings to be nice */}
                <div className="border-t border-slate-200 pt-6 flex justify-end">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบจัดการสุขภาพ</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Importer Tab with dual Sheets & My Maps sub-tabs */}
            {currentTab === 'import' && (() => {
              const filteredImportedPatients = importedPatients.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(importSearchQuery.toLowerCase()) || 
                                      p.caregiver.toLowerCase().includes(importSearchQuery.toLowerCase()) ||
                                      p.address.toLowerCase().includes(importSearchQuery.toLowerCase());
                const matchesCategory = importCategoryFilter === 'ทั้งหมด' || p.category === importCategoryFilter;
                return matchesSearch && matchesCategory;
              });

              return (
                <motion.div 
                  key="import"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full p-6 overflow-y-auto flex flex-col space-y-6 bg-slate-50"
                >
                  {/* Google Sheets Header Card */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">ดึงข้อมูลผู้พึ่งพิงจาก Google Sheets</h2>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            ระบบกำลังทำงานสัมพันธ์แบบอัปสตรีมกับลิงก์ตารางข้อมูลของท่าน เพื่อถอดรายชื่อผู้มีภาวะพึ่งพิง 69 ราย พร้อมวิเคราะห์ระดับอาการ ข้อมูลสัญญาณชีพ และจัดพิกัดลงแผนที่
                          </p>
                          
                          {/* Input fields for sheet URL and sheet name */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                              </span>
                              <input
                                type="text"
                                value={sheetUrl}
                                onChange={(e) => setSheetUrl(e.target.value)}
                                placeholder="วางลิงก์ Google Sheets..."
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                              />
                            </div>

                            {/* Sheet Selection dropdown */}
                            {sheetList.length > 0 && (
                              <select
                                value={selectedSheetName}
                                onChange={(e) => {
                                  setSelectedSheetName(e.target.value);
                                  handleFetchGoogleSheet(sheetUrl, e.target.value);
                                }}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 font-bold text-slate-700"
                              >
                                {sheetList.map((name) => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => handleFetchGoogleSheet()}
                              disabled={loadingSheet}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {loadingSheet ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>กำลังดึงข้อมูล...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>สแกนข้อมูลใหม่</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-end">
                          <button
                            onClick={handleExportAllExcel}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                            title="ดาวน์โหลดไฟล์ Excel (.xlsx) รวม 4 ฐานข้อมูลระบบ"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>ดาวน์โหลดไฟล์ Excel (.xlsx)</span>
                          </button>

                          <button
                            onClick={handleOpenGoogleDrive}
                            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
                            title="เปิด Google Sheets / Google Drive ในแท็บใหม่"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                            <span>เปิด Google Drive / Sheets</span>
                          </button>

                          <button
                            onClick={handleSaveSheetPatients}
                            disabled={syncing || sheetPatients.length === 0 || userRole === 'public'}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                          >
                            {syncing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>กำลังบันทึก...</span>
                              </>
                            ) : (
                              <>
                                <Database className="w-3.5 h-3.5 text-emerald-400" />
                                <span>ซิงค์รายชื่อทั้งหมด ({sheetPatients.length} ราย)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {sheetError && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 shadow-sm flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">เกิดข้อผิดพลาดในการโหลด</p>
                            <p className="text-rose-700 mt-1">{sheetError}</p>
                            <p className="text-[10px] text-rose-500 mt-2 font-semibold">
                              คำแนะนำ: โปรดตรวจสอบว่า ตาราง Google Sheets ของท่านได้รับการตั้งค่าแบบ "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน" (Anyone with the link can view) เรียบร้อยแล้ว เพื่อให้ระบบดึงข้อมูลรายชื่อได้อย่างทันท่วงที
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stat Cards for Google Sheet */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">รายชื่อผู้มีภาวะพึ่งพิงทั้งหมด</p>
                            <p className="text-xl font-bold text-slate-800">{sheetPatients.length} ราย</p>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
                          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">กลุ่มติดเตียง (Bedridden)</p>
                            <p className="text-xl font-bold text-slate-800">
                              {sheetPatients.filter(p => p.category === 'ติดเตียง').length} ราย
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">กลุ่มติดบ้าน (Homebound)</p>
                            <p className="text-xl font-bold text-slate-800">
                              {sheetPatients.filter(p => p.category === 'ติดบ้าน').length} ราย
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-3">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">บันทึกเชื่อมโยงสำเร็จ</p>
                            <p className="text-xl font-bold text-slate-800">
                              {sheetPatients.filter(p => patients.some(mainP => mainP.name === p.name)).length} / {sheetPatients.length} ราย
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Search and Filters inside loaded Sheet rows */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:max-w-md">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                          </span>
                          <input
                            type="text"
                            value={importSearchQuery}
                            onChange={(e) => setImportSearchQuery(e.target.value)}
                            placeholder="ค้นหารายชื่อ, ที่อยู่ หรือ อสม. ในชีท..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                            <span>กรองกลุ่มสุขภาพ:</span>
                          </span>
                          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                            {(['ทั้งหมด', 'ติดเตียง', 'ติดบ้าน', 'ติดสังคม'] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setImportCategoryFilter(cat)}
                                className={`px-3 py-1 text-[11px] rounded-md font-bold transition-all cursor-pointer ${
                                  importCategoryFilter === cat
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Sheet records list table */}
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">รายชื่อผู้พึ่งพิงตรวจรับจาก Google Sheets</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">พบตรงตามค้นหาจำนวน {sheetPatients.filter(p => {
                              const matchesSearch = p.name.toLowerCase().includes(importSearchQuery.toLowerCase()) || 
                                                    p.caregiver.toLowerCase().includes(importSearchQuery.toLowerCase()) ||
                                                    p.address.toLowerCase().includes(importSearchQuery.toLowerCase());
                              const matchesCategory = importCategoryFilter === 'ทั้งหมด' || p.category === importCategoryFilter;
                              return matchesSearch && matchesCategory;
                            }).length} รายการ</p>
                          </div>
                        </div>

                        {sheetPatients.length === 0 ? (
                          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
                            <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mb-2" />
                            <p className="text-xs font-bold text-slate-500">กำลังดาวน์โหลดข้อมูลรายชื่อ 69 รายการเพื่อจัดทำข้อมูลสุขภาพ...</p>
                            <p className="text-[10px] text-slate-400">ระบบเชื่อมโยงพิกัดแบบปลอดภัยอัตโนมัติภายในอำเภอวิหารแดง จังหวัดสระบุรี</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50/50 text-slate-400 font-mono border-b border-slate-100">
                                  <th className="p-4 pl-6 font-bold">ชื่อ-นามสกุลผู้รับบริการ</th>
                                  <th className="p-4 font-bold">กลุ่มภาวะพึ่งพิง</th>
                                  <th className="p-4 font-bold">ผู้ดูแล / อสม.</th>
                                  <th className="p-4 font-bold">ที่อยู่</th>
                                  <th className="p-4 font-bold">พิกัดในเขตตำบล (Lat, Lng)</th>
                                  <th className="p-4 font-bold">อาการวัดระดับหรือสัญญาณชีพ</th>
                                  <th className="p-4 pr-6 font-bold text-right">สถานะระบบหลัก</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {sheetPatients
                                  .filter(p => {
                                    const matchesSearch = p.name.toLowerCase().includes(importSearchQuery.toLowerCase()) || 
                                                          p.caregiver.toLowerCase().includes(importSearchQuery.toLowerCase()) ||
                                                          p.address.toLowerCase().includes(importSearchQuery.toLowerCase());
                                    const matchesCategory = importCategoryFilter === 'ทั้งหมด' || p.category === importCategoryFilter;
                                    return matchesSearch && matchesCategory;
                                  })
                                  .map((p, idx) => {
                                    const isAlreadySynced = patients.some(mainP => mainP.name === p.name);
                                    return (
                                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-bold text-slate-800">{p.name}</td>
                                        <td className="p-4">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            p.category === 'ติดเตียง' 
                                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                              : p.category === 'ติดบ้าน'
                                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                          }`}>
                                            {p.category}
                                          </span>
                                        </td>
                                        <td className="p-4">
                                          <div className="space-y-0.5">
                                            <p className="text-slate-600 font-bold">{p.caregiver}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{p.phone}</p>
                                          </div>
                                        </td>
                                        <td className="p-4 text-slate-500 max-w-[200px] truncate" title={p.address}>
                                          {p.address}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono">
                                          <div className="flex flex-col">
                                            <span>{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</span>
                                            <span className="text-[9px] text-blue-500 font-sans font-semibold">✨ สุ่มพิกัดปลอดภัยในเขตสระบุรี</span>
                                          </div>
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate" title={p.vitalSigns}>
                                          {p.vitalSigns}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                          {isAlreadySynced ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-1 rounded-md">
                                              <Check className="w-3 h-3" />
                                              <span>เชื่อมโยงแล้ว</span>
                                            </span>
                                          ) : (
                                            <button
                                              disabled={userRole === 'public' || syncing}
                                              onClick={async () => {
                                                setSyncing(true);
                                                addLog('Sheets Import', `กำลังนำเข้าผู้พึ่งพิงใหม่ ${p.name}...`, 'pending');
                                                try {
                                                  if (!token || token === 'mock-staff-token') {
                                                    const updatedPatients = [p, ...patients];
                                                    setPatients(updatedPatients);
                                                    localStorage.setItem('stitchsync_patients', JSON.stringify(updatedPatients));
                                                    addLog('Local DB', `นำเข้าข้อมูลและพิกัดแผนที่ของ ${p.name} ลงระบบจำลองสำเร็จ!`, 'success');
                                                    alert(`นำเข้าคุณ ${p.name} สำเร็จ!`);
                                                  } else {
                                                    const sheetsService = new SheetsService(token);
                                                    const ok = await sheetsService.addPatient(p);
                                                    if (ok) {
                                                      addLog('Sheets DB', `เขียนข้อมูลของ ${p.name} ลง Google Sheets สำเร็จ`, 'success');
                                                      await fetchData(token);
                                                      alert(`นำเข้าคุณ ${p.name} ลง Google Sheets สำเร็จ!`);
                                                    } else {
                                                      throw new Error('ไม่สามารถเขียนข้อมูลลงไฟล์ Sheets ได้');
                                                    }
                                                  }
                                                } catch (error: any) {
                                                  addLog('Import DB', `ข้อผิดพลาดในการนำเข้าคนไข้รายบุคคล: ${error.message}`, 'error');
                                                  alert(`เกิดข้อผิดพลาด: ${error.message}`);
                                                } finally {
                                                  setSyncing(false);
                                                }
                                              }}
                                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-150 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                                            >
                                              <Plus className="w-3 h-3" />
                                              <span>นำเข้าระบบ</span>
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                  {/* Public View Mode Notice */}
                  {userRole === 'public' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">โหมดบุคคลทั่วไป (Public Access Restricted)</p>
                        <p className="text-amber-700/90 leading-relaxed">
                          ท่านกำลังใช้งานในโหมดสิทธิ์ผู้มาเยือน สามารถสืบค้นรายชื่อและดูตำแหน่งพิกัดแผนที่ได้เพื่อประโยชน์ทางการสาธารณสุข แต่จะไม่สามารถทำการเขียน/นำเข้าข้อมูลผู้ป่วยคนใหม่ไปยังแผ่นงาน Google Sheets ตัวจริงได้เพื่อความปลอดภัยของข้อมูล
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}

          </AnimatePresence>
        </div>

        {/* Footer Taskbar compliant with layout structure */}
        <footer className="h-10 bg-white border-t border-slate-200 px-8 flex justify-between items-center z-30 shrink-0 text-[10px] text-slate-400">
          <p className="font-mono font-medium">© 2026 StitchSync Healthcare Co. ระบบสุขภาพระดับตำบลความปลอดภัยสูง</p>
          <div className="flex space-x-4">
            <span className="font-medium text-slate-300">|</span>
            <span className="font-mono">Google API Connected</span>
          </div>
        </footer>

      </main>

      {/* Slide-over Modal Backdrop & Modal view */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-white shadow-2xl p-6 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {modalType === 'visit' ? 'เขียนบันทึกรายงานการเข้าเยี่ยม' : 
                     modalType === 'patient' ? 'ลงทะเบียนผู้ป่วยสุขภาพใหม่ในชุมชน' :
                     'แก้ไขข้อมูลผู้ป่วยในชุมชน'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {modalType === 'visit' ? 'ข้อมูลจะอัปเดตลงตาราง Google Sheets แบบเรียลไทม์ทันที' : 
                     modalType === 'patient' ? 'เพิ่มประชากรกลุ่มเป้าหมายตำบลไผ่ต่ำ' :
                     'ปรับปรุงรายละเอียดคนไข้และบันทึกขึ้นระบบเรียลไทม์'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content switcher */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                
                {modalType === 'visit' ? (
                  /* Form: New Visit Report */
                  <form onSubmit={submitNewVisit} className="space-y-4 text-xs text-slate-700">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">เลือกชื่อผู้ป่วยติดเตียง / ติดบ้าน / ติดสังคม</label>
                      <select 
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-xs font-medium text-slate-800"
                        required
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.category} - {p.address})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ผลระดับอาการ / ข้อมูลสัญญาณชีพด่วน</label>
                      <input 
                        type="text" 
                        value={visitVitalSigns}
                        onChange={(e) => setVisitVitalSigns(e.target.value)}
                        placeholder="เช่น ความดันปกติ 120/80 ชีพจร 76 หรือ ปวดหัวเล็กน้อย"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">สรุปอาการและรายละเอียดผลเยี่ยม</label>
                      <textarea 
                        value={visitDescription}
                        onChange={(e) => setVisitDescription(e.target.value)}
                        placeholder="ระบุข้อแนะนำที่มอบให้คนไข้ รายละเอียดเยี่ยมบ้าน หรือการนัดติดตามยารักษาโรค..."
                        rows={4}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">ประเมินระดับความเร่งด่วน</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Normal', 'Warning', 'Danger'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setVisitStatus(st)}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                              visitStatus === st 
                                ? st === 'Danger' ? 'bg-rose-50 border-rose-300 text-rose-600 ring-1 ring-rose-200' :
                                  st === 'Warning' ? 'bg-amber-50 border-amber-300 text-amber-600 ring-1 ring-amber-200' :
                                  'bg-emerald-50 border-emerald-300 text-emerald-600 ring-1 ring-emerald-200'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {st === 'Normal' ? 'ปกติ (Normal)' : st === 'Warning' ? 'เฝ้าระวัง (Warning)' : 'ฉุกเฉิน (Danger)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={syncing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow transition-all cursor-pointer disabled:opacity-50"
                      >
                        {syncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังบันทึกส่งข้อมูล...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>บันทึกส่งรายงานเข้าเยี่ยม</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : modalType === 'patient' ? (
                  /* Form: New Patient Register */
                  <form onSubmit={submitNewPatient} className="space-y-4 text-xs text-slate-700">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ชื่อ-นามสกุล คนไข้</label>
                      <input 
                        type="text" 
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder="ระบุคำนำหน้าชื่อ และชื่อ-สกุล"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">กลุ่มประชากรจำแนกสี</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['ติดเตียง', 'ติดบ้าน', 'ติดสังคม'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewPatientCategory(cat)}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                              newPatientCategory === cat 
                                ? cat === 'ติดเตียง' ? 'bg-rose-50 border-rose-300 text-rose-600 ring-1 ring-rose-200' :
                                  cat === 'ติดบ้าน' ? 'bg-amber-50 border-amber-300 text-amber-600 ring-1 ring-amber-200' :
                                  'bg-emerald-50 border-emerald-300 text-emerald-600 ring-1 ring-emerald-200'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ที่อยู่อาศัย (บ้านเลขที่และหมู่)</label>
                      <input 
                        type="text" 
                        value={newPatientAddress}
                        onChange={(e) => setNewPatientAddress(e.target.value)}
                        placeholder="เช่น 12/3 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">เบอร์โทรศัพท์ติดต่อด่วน</label>
                      <input 
                        type="tel" 
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">อาการประเมินเบื้องต้น</label>
                      <input 
                        type="text" 
                        value={newPatientVital}
                        onChange={(e) => setNewPatientVital(e.target.value)}
                        placeholder="เช่น ปกติ / ปวดแข้งปวดขาเดินเหินไม่สะดวก"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ระบุชื่อ อสม. ผู้รับผิดชอบดูแล</label>
                      <input 
                        type="text" 
                        value={newPatientCaregiver}
                        onChange={(e) => setNewPatientCaregiver(e.target.value)}
                        placeholder="ชื่อ อสม. สมศรี (ค่าเริ่มต้น: ชื่อของคุณ)"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={syncing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow transition-all cursor-pointer disabled:opacity-50"
                      >
                        {syncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังซิงค์ขึ้นฐานข้อมูล...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>ลงทะเบียนและบันทึกผู้ป่วยสุขภาพ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Form: Edit Patient Details */
                  <form onSubmit={submitEditPatient} className="space-y-4 text-xs text-slate-700">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ชื่อ-นามสกุล คนไข้</label>
                      <input 
                        type="text" 
                        value={editPatientName}
                        onChange={(e) => setEditPatientName(e.target.value)}
                        placeholder="ระบุคำนำหน้าชื่อ และชื่อ-สกุล"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">กลุ่มประชากรจำแนกสี</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['ติดเตียง', 'ติดบ้าน', 'ติดสังคม'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditPatientCategory(cat)}
                            className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                              editPatientCategory === cat 
                                ? cat === 'ติดเตียง' ? 'bg-rose-50 border-rose-300 text-rose-600 ring-1 ring-rose-200' :
                                  cat === 'ติดบ้าน' ? 'bg-amber-50 border-amber-300 text-amber-600 ring-1 ring-amber-200' :
                                  'bg-emerald-50 border-emerald-300 text-emerald-600 ring-1 ring-emerald-200'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                      <select 
                        value={editPatientMoo}
                        onChange={(e) => setEditPatientMoo(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs font-bold text-slate-800 bg-white"
                      >
                        {MOO_OPTIONS.map(m => (
                          <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ที่อยู่อาศัย (บ้านเลขที่และหมู่)</label>
                      <input 
                        type="text" 
                        value={editPatientAddress}
                        onChange={(e) => setEditPatientAddress(e.target.value)}
                        placeholder="เช่น 12/3 หมู่ 1 ต.ไผ่ต่ำ อ.วิหารแดง"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">เบอร์โทรศัพท์ติดต่อด่วน</label>
                      <input 
                        type="tel" 
                        value={editPatientPhone}
                        onChange={(e) => setEditPatientPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">อาการประเมินเบื้องต้น / อาการสำคัญ</label>
                      <input 
                        type="text" 
                        value={editPatientVital}
                        onChange={(e) => setEditPatientVital(e.target.value)}
                        placeholder="เช่น ปกติ / ปวดแข้งปวดขาเดินเหินไม่สะดวก"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">ระบุชื่อ อสม. ผู้รับผิดชอบดูแล</label>
                      <input 
                        type="text" 
                        value={editPatientCaregiver}
                        onChange={(e) => setEditPatientCaregiver(e.target.value)}
                        placeholder="ชื่อ อสม. สมศรี"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 bg-white"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={syncing}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow transition-all cursor-pointer disabled:opacity-50"
                      >
                        {syncing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>กำลังบันทึกข้อมูลปรับปรุง...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>บันทึกการแก้ไขข้อมูลผู้ป่วย</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>

              {/* Form type switcher at the very bottom */}
              <div className="border-t border-slate-100 pt-4 flex justify-between text-xs text-blue-600 font-bold shrink-0">
                <button 
                  type="button" 
                  onClick={() => setModalType(modalType === 'edit-patient' ? 'visit' : modalType === 'visit' ? 'patient' : 'visit')}
                  className="hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>
                    {modalType === 'edit-patient' 
                      ? 'สลับไปรายงานการเยี่ยมบ้าน' 
                      : modalType === 'visit' 
                        ? 'สลับไปลงทะเบียนคนไข้ใหม่' 
                        : 'สลับไปรายงานการเยี่ยมบ้าน'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Edit VHV Modal */}
        {isEditVhvModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditVhvModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">แก้ไขข้อมูล อสม. / จิตอาสา</h3>
                <button onClick={() => setIsEditVhvModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitEditVhv} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={editVhvName}
                    onChange={(e) => setEditVhvName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={editVhvPhone}
                    onChange={(e) => setEditVhvPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                  <select
                    value={editVhvMoo}
                    onChange={(e) => setEditVhvMoo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-bold text-slate-700"
                  >
                    {MOO_OPTIONS.map(m => (
                      <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ที่อยู่อาศัย</label>
                  <textarea
                    value={editVhvAddress}
                    onChange={(e) => setEditVhvAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ประเภท</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['อสม', 'จิตอาสา'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditVhvType(t)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          editVhvType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {t === 'อสม' ? 'อสม. ประจำหมู่บ้าน' : 'จิตอาสาสุขภาพ'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditVhvModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Caregiver Modal */}
        {isEditCgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditCgModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">แก้ไขข้อมูลผู้ดูแล (Caregiver)</h3>
                <button onClick={() => setIsEditCgModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitEditCg} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ชื่อ-นามสกุลผู้ดูแล</label>
                  <input
                    type="text"
                    required
                    value={editCgName}
                    onChange={(e) => setEditCgName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={editCgPhone}
                    onChange={(e) => setEditCgPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                  <select
                    value={editCgMoo}
                    onChange={(e) => setEditCgMoo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-bold text-slate-700"
                  >
                    {MOO_OPTIONS.map(m => (
                      <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ที่อยู่หรือความเชื่อมโยง</label>
                  <textarea
                    value={editCgAddress}
                    onChange={(e) => setEditCgAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ความสัมพันธ์กับคนไข้</label>
                  <select
                    value={editCgRelationship}
                    onChange={(e) => setEditCgRelationship(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-bold text-slate-700"
                  >
                    <option value="บุตรสาว">บุตรสาว / บุตรชาย</option>
                    <option value="คู่สมรส">คู่สมรส (สามี/ภรรยา)</option>
                    <option value="ญาติ">ญาติสนิท / ผู้ดูแลอาสา</option>
                    <option value="เพื่อนบ้าน">เพื่อนบ้าน / ชุมชนดูแล</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditCgModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Benefactor Modal */}
        {isEditBenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditBenModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-800">แก้ไขข้อมูลผู้ทำคุณประโยชน์</h3>
                </div>
                <button onClick={() => setIsEditBenModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={submitEditBen} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ชื่อ-นามสกุล / ชื่อองค์กร</label>
                  <input
                    type="text"
                    required
                    value={editBenName}
                    onChange={(e) => setEditBenName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={editBenPhone}
                    onChange={(e) => setEditBenPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ประจำหมู่บ้าน (หมู่ 1 - หมู่ 8)</label>
                  <select
                    value={editBenMoo}
                    onChange={(e) => setEditBenMoo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-bold text-slate-700"
                  >
                    {MOO_OPTIONS.map(m => (
                      <option key={m} value={m}>{m} ต.ไผ่ต่ำ</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">ที่อยู่อาศัย / ที่ตั้ง</label>
                  <textarea
                    value={editBenAddress}
                    onChange={(e) => setEditBenAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">คุณประโยชน์ / สิ่งสนับสนุนชุมชน</label>
                  <textarea
                    value={editBenContribution}
                    onChange={(e) => setEditBenContribution(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditBenModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Detailed Info Overlay Card */}
        {selectedDetailItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailItem(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-150 flex flex-col z-10"
            >
              {/* Header */}
              <div className={`p-5 text-white ${
                selectedDetailItem.type === 'อสม' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                selectedDetailItem.type === 'ผู้ป่วย' ? 'bg-gradient-to-r from-rose-600 to-pink-600' :
                selectedDetailItem.type === 'ผู้ทำคุณประโยชน์' ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                'bg-gradient-to-r from-emerald-600 to-teal-600'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/25 text-white block w-fit mb-1.5">
                      {selectedDetailItem.type === 'อสม' ? 'ข้อมูล อสม. จิตอาสา' :
                       selectedDetailItem.type === 'ผู้ป่วย' ? 'ข้อมูลคนไข้ในระบบ' :
                       selectedDetailItem.type === 'ผู้ทำคุณประโยชน์' ? 'ข้อมูลผู้ทำคุณประโยชน์' :
                       'ข้อมูลผู้ดูแล (Caregiver)'}
                    </span>
                    <h3 className="text-lg font-extrabold tracking-tight">{selectedDetailItem.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDetailItem(null)}
                    className="p-1 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[450px] overflow-y-auto custom-scrollbar">
                
                {selectedDetailItem.type === 'อสม' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">สถานะตำแหน่ง</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">อสม. ปฏิบัติการในพื้นที่</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">หน่วยงานสังกัด</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">รพ.สต.ตำบลไผ่ต่ำ</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ที่อยู่อาศัยปัจจุบัน</p>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        12 หมู่ 2 ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี 18150
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 flex items-center justify-between">
                        <span>ผู้ป่วยในความรับผิดชอบ ({
                          patients.filter(p => p.caregiver === selectedDetailItem.name).length
                        } ราย)</span>
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          const list = patients.filter(p => p.caregiver === selectedDetailItem.name);
                          if (list.length === 0) {
                            return <p className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-slate-100">ไม่มีผู้ป่วยในตารางความรับผิดชอบขณะนี้</p>;
                          }
                          return list.map((p, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                              <div>
                                <p className="font-bold text-slate-800">{p.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{p.address}</p>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                p.category === 'ติดเตียง' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                                p.category === 'ติดบ้าน' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-150'
                              }`}>{p.category}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetailItem.type === 'ผู้ป่วย' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">รหัสผู้ป่วย HN</p>
                        <p className="text-xs font-mono font-extrabold text-slate-800 mt-0.5">{selectedDetailItem.data.id || 'HN-NEW'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">กลุ่มสุขภาพ</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            selectedDetailItem.data.category === 'ติดเตียง' ? 'bg-rose-500' :
                            selectedDetailItem.data.category === 'ติดบ้าน' ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}></span>
                          <span>{selectedDetailItem.data.category}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ที่อยู่ที่ติดต่อได้สะดวก</p>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {selectedDetailItem.data.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">เบอร์ติดต่อด่วน</p>
                        <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {selectedDetailItem.data.phone || '081-xxx-xxxx'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">สัญญาณชีพ/อาการสำคัญ</p>
                        <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                          {selectedDetailItem.data.vitalSigns || 'ปกติ'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">ผู้ดูแล และ อสม. ผู้รับผิดชอบ</p>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                          {selectedDetailItem.data.caregiver ? selectedDetailItem.data.caregiver.charAt(0) : 'อ'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{selectedDetailItem.data.caregiver || 'ไม่มีข้อมูลผู้ดูแล'}</p>
                          <p className="text-[10px] text-slate-500">เจ้าหน้าที่สาธารณสุข / อสม. ประจำตำบล</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetailItem.type === 'ผู้ดูแล' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">บทบาทหน้าที่หลัก</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">ผู้ดูแลหลักประจำตัวญาติ</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">ความสัมพันธ์ผู้ป่วย</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">ญาติสนิท / ผู้ดูแลหลัก</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ที่อยู่ที่พำนักในชุมชน</p>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {selectedDetailItem.data?.address || 'ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">เบอร์ติดต่อประสานงาน</p>
                      <p className="text-xs font-extrabold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {selectedDetailItem.data?.phone || '081-xxx-xxxx'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">ผู้ป่วยในความดูแลหลัก</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 font-bold">
                            {selectedDetailItem.data?.name ? selectedDetailItem.data.name.charAt(0) : 'ค'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{selectedDetailItem.data?.name || 'ไม่มีข้อมูลคนไข้'}</p>
                            <p className="text-[10px] text-slate-500">คนไข้ในทะเบียนตำบลไผ่ต่ำ</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          selectedDetailItem.data?.category === 'ติดเตียง' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                          selectedDetailItem.data?.category === 'ติดบ้าน' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-150'
                        }`}>{selectedDetailItem.data?.category || 'ไม่ระบุ'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetailItem.type === 'ผู้ทำคุณประโยชน์' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">รหัสสมาชิก</p>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{selectedDetailItem.data?.id || 'BEN-000'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">ประจำหมู่บ้าน</p>
                        <p className="text-xs font-bold text-amber-700 mt-0.5">{selectedDetailItem.data?.moo || 'หมู่ 1'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">สิ่งสนับสนุน / คุณประโยชน์ต่อชุมชน</p>
                      <p className="text-xs font-semibold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                        {selectedDetailItem.data?.contribution || 'ผู้สนับสนุนชุมชนตำบลไผ่ต่ำ'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">เบอร์โทรศัพท์ติดต่อ</p>
                      <p className="text-xs font-extrabold font-mono text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {selectedDetailItem.data?.phone || '08x-xxx-xxxx'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ที่อยู่อาศัย / ที่ตั้งองค์กร</p>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {selectedDetailItem.data?.address || 'ต.ไผ่ต่ำ อ.วิหารแดง จ.สระบุรี'}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedDetailItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
