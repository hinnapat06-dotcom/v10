import * as XLSX from 'xlsx';
import { Patient, Activity } from '../types';

/**
 * Exports all system datasets (Patients, VHVs, Caregivers, Visit Activities)
 * into a single multi-sheet Microsoft Excel (.xlsx) file.
 */
export function exportAllToExcel(
  patients: Patient[],
  vhvs: any[],
  caregivers: any[],
  activities: Activity[]
) {
  const wb = XLSX.utils.book_new();

  // 1. ผู้ป่วยภาวะพึ่งพิง
  const patientData = patients.map((p, idx) => ({
    'ลำดับ': idx + 1,
    'รหัส HN': p.id,
    'ชื่อ-นามสกุล': p.name,
    'ประจำหมู่บ้าน': p.moo || 'หมู่ 1',
    'กลุ่มภาวะพึ่งพิง': p.category,
    'อสม. ผู้รับผิดชอบ': p.caregiver,
    'เบอร์โทรศัพท์': p.phone || '-',
    'สัญญาณชีพล่าสุด': p.vitalSigns || '-',
    'ที่อยู่อาศัย': p.address,
    'พิกัด ละติจูด': p.lat || '',
    'พิกัด ลองจิจูด': p.lng || '',
    'เยี่ยมล่าสุด': p.lastVisited || '-'
  }));
  const patientWs = XLSX.utils.json_to_sheet(patientData);
  XLSX.utils.book_append_sheet(wb, patientWs, 'ผู้ป่วยภาวะพึ่งพิง');

  // 2. อสม. และจิตอาสา
  const vhvData = vhvs.map((v, idx) => ({
    'ลำดับ': idx + 1,
    'รหัส อสม.': v.id || `VHV-${idx + 1}`,
    'ชื่อ-นามสกุล': v.name || '-',
    'ประจำหมู่บ้าน': v.moo || 'หมู่ 1',
    'ประเภท': v.type || 'อสม',
    'เบอร์โทรศัพท์': v.phone || '-',
    'ที่อยู่': v.address || '-'
  }));
  const vhvWs = XLSX.utils.json_to_sheet(vhvData);
  XLSX.utils.book_append_sheet(wb, vhvWs, 'อสม_จิตอาสา');

  // 3. ผู้ดูแลหลัก (Caregivers)
  const cgData = caregivers.map((c, idx) => ({
    'ลำดับ': idx + 1,
    'รหัสผู้ดูแล': c.id || `CG-${idx + 1}`,
    'ชื่อ-นามสกุล': c.name || '-',
    'ประจำหมู่บ้าน': c.moo || 'หมู่ 1',
    'ความสัมพันธ์กับคนไข้': c.relationship || '-',
    'เบอร์โทรศัพท์': c.phone || '-',
    'ที่อยู่': c.address || '-'
  }));
  const cgWs = XLSX.utils.json_to_sheet(cgData);
  XLSX.utils.book_append_sheet(wb, cgWs, 'ผู้ดูแลหลัก_Caregivers');

  // 4. บันทึกการเยี่ยมบ้าน (Activities)
  const actData = activities.map((a, idx) => ({
    'ลำดับ': idx + 1,
    'เวลา/วันที่': a.timestamp || '-',
    'ชื่อผู้ป่วย': a.patientName || '-',
    'ผู้บันทึก/ผู้เยี่ยม': a.caregiverName || '-',
    'ประเภทกิจกรรม': a.type || '-',
    'สถานะสุขภาพ': a.status || '-',
    'รายละเอียดการเยี่ยม': a.description || '-'
  }));
  const actWs = XLSX.utils.json_to_sheet(actData);
  XLSX.utils.book_append_sheet(wb, actWs, 'บันทึกการเยี่ยมบ้าน');

  // Generate date stamp
  const todayStr = new Date().toISOString().split('T')[0];
  const fileName = `รายงานสุขภาพตำบลไผ่ต่ำ_${todayStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export a single array of objects to Excel
 */
export function exportSingleTableToExcel(data: any[], sheetName: string, defaultFileName: string) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const fileName = defaultFileName.endsWith('.xlsx') ? defaultFileName : `${defaultFileName}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
