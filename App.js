import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = { ink: '#102A2B', muted: '#6A7C7C', teal: '#0F6864', mint: '#D9EFEB', bg: '#F4F8F7', white: '#FFFFFF', line: '#DCE8E5', red: '#C9514C', amber: '#C88728', green: '#237A57', navy: '#183B4B' };
const roles = { PATIENT: 'Patient', DOCTOR: 'Doctor', HOSPITAL: 'Hospital', DONOR: 'Donor' };

const CONNECTION_STATUS = { NOT_CONNECTED: 'NOT_CONNECTED', PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED' };

const seed = {
  user: { id: 'donor-1', name: 'Ayesha Khan', role: 'DONOR', area: 'Islamabad', bloodGroup: 'B+' },
  hospitals: [
    { id: 'h-xyz', name: 'XYZ Hospital', area: 'Islamabad', followers: 12400, verified: true, followed: false, description: 'Specialist care with a human approach. Emergency, oncology and cardiac services.' },
    { id: 'h-shifa', name: 'Shifa Medical Centre', area: 'Rawalpindi', followers: 8200, verified: true, followed: true, description: 'Trusted community care and specialist consultations.' }
  ],
  doctors: [
    { id: 'd-1', name: 'Dr. Sara Malik', specialty: 'Oncologist', hospital: 'XYZ Hospital', distance: '4.2 km', rating: '4.9', available: true },
    { id: 'd-2', name: 'Dr. Hamza Qureshi', specialty: 'Neurologist', hospital: 'Shifa Medical Centre', distance: '8.7 km', rating: '4.8', available: true },
    { id: 'd-3', name: 'Dr. Mariam Shah', specialty: 'Endocrinologist', hospital: 'XYZ Hospital', distance: '11.4 km', rating: '4.7', available: false }
  ],
  patients: [
    { id: 'patient-1', name: 'Ayesha Khan', role: 'PATIENT', area: 'Islamabad', bloodGroup: 'B+', diseaseDetails: 'Cancer follow-up' },
    { id: 'patient-2', name: 'Maham Iqbal', role: 'PATIENT', area: 'Rawalpindi', bloodGroup: 'A-', diseaseDetails: 'Diabetes management' }
  ],
  connections: [
    { id: 'conn-1', patientId: 'patient-1', doctorId: 'd-1', status: CONNECTION_STATUS.ACCEPTED, createdAt: '2026-09-20T10:00:00Z', acceptedAt: '2026-09-21T14:30:00Z', rejectedAt: null },
    { id: 'conn-2', patientId: 'patient-2', doctorId: 'd-2', status: CONNECTION_STATUS.PENDING, createdAt: '2026-09-25T09:00:00Z', acceptedAt: null, rejectedAt: null },
    { id: 'conn-3', patientId: 'patient-2', doctorId: 'd-3', status: CONNECTION_STATUS.REJECTED, createdAt: '2026-09-15T08:00:00Z', acceptedAt: null, rejectedAt: '2026-09-16T12:00:00Z' }
  ],
  posts: [{ id: 'p-1', hospitalId: 'h-xyz', title: 'Free cardiac screening camp', body: 'Our specialists will be available this Saturday for community screening.', type: 'Health information', time: '2h ago' }],
  requests: [{ id: 'b-1', hospitalId: 'h-shifa', bloodGroup: 'O-', units: 1, urgency: 'URGENT', status: 'ACTIVE', location: 'Rawalpindi', title: 'O- blood needed', responses: 3 }],
  notifications: [{ id: 'n-1', type: 'SYSTEM', title: 'Welcome to Nexcure', body: 'Your care workspace is ready.', read: false }],
  appointments: [], reports: [], responses: [],
  messages: [
    { id: 'm-1', senderId: 'doctor-1', receiverId: 'patient-1', conversationId: 'conv-1', body: 'Hello Ayesha, how can I help today?', time: '09:42', read: false, unread: true, doctor: 'Dr. Sara Malik' },
    { id: 'm-2', senderId: 'doctor-1', receiverId: 'patient-1', conversationId: 'conv-1', body: 'I have reviewed your recent report. Please book a follow-up slot.', time: 'Yesterday', read: true, unread: false, doctor: 'Dr. Sara Malik' }
  ]
};

function cloneSeed() { return JSON.parse(JSON.stringify(seed)); }
function Icon({ name, size = 22, color = colors.ink }) { return <Ionicons name={name} size={size} color={color} />; }
function Button({ title, onPress, variant = 'primary', icon }) { return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.button, variant === 'secondary' && styles.secondaryButton, variant === 'danger' && styles.dangerButton]}><Icon name={icon} size={18} color={variant === 'primary' ? colors.white : variant === 'danger' ? colors.red : colors.teal} /><Text style={[styles.buttonText, variant !== 'primary' && styles.secondaryButtonText]}>{title}</Text></TouchableOpacity>; }
function Badge({ children, tone = 'teal' }) { return <View style={[styles.badge, tone === 'red' && styles.redBadge, tone === 'green' && styles.greenBadge]}><Text style={[styles.badgeText, tone === 'red' && { color: colors.red }, tone === 'green' && { color: colors.green }]}>{children}</Text></View>; }
function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
function Section({ title, action, onAction, children }) { return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && <TouchableOpacity onPress={onAction}><Text style={styles.link}>{action}</Text></TouchableOpacity>}</View>{children}</View>; }
function Header({ title, subtitle, onBack }) { return <View style={styles.header}>{onBack && <TouchableOpacity onPress={onBack} style={styles.back}><Icon name="arrow-back" size={22} color={colors.ink} /></TouchableOpacity>}<View><Text style={styles.eyebrow}>NEXCURE</Text><Text style={styles.screenTitle}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View></View>; }
function Avatar({ letter = 'A', large = false }) { return <View style={[styles.avatar, large && styles.largeAvatar]}><Text style={[styles.avatarText, large && styles.largeAvatarText]}>{letter}</Text></View>; }

export default function App() {
  const [data, setData] = useState(cloneSeed);
  const [screen, setScreen] = useState('home');
  const [role, setRole] = useState('DONOR');
  const [login, setLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ fullName: '', email: '', password: '', role: 'PATIENT' });
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(15);
  const [toast, setToast] = useState('');
  const [prescription, setPrescription] = useState(null);

  const currentHospital = selectedHospital || data.hospitals[0];
  const DISEASE_TO_SPECIALTY = {
    cancer: ['oncologist'],
    'brain tumor': ['neurologist', 'oncologist'],
    tumor: ['neurologist', 'oncologist'],
    cardiac: ['cardiologist'],
    heart: ['cardiologist'],
    ortho: ['orthopedic surgeon'],
    'bone fracture': ['orthopedic surgeon'],
    fracture: ['orthopedic surgeon'],
    diabetes: ['endocrinologist'],
    thyroid: ['endocrinologist'],
    endocrine: ['endocrinologist'],
    skin: ['dermatologist'],
    rash: ['dermatologist'],
    eczema: ['dermatologist'],
    psoriasis: ['dermatologist'],
    eye: ['ophthalmologist'],
    vision: ['ophthalmologist'],
    kidney: ['nephrologist'],
    'kidney stone': ['nephrologist'],
    liver: ['gastroenterologist'],
    stomach: ['gastroenterologist'],
    digestive: ['gastroenterologist'],
    child: ['pediatrician'],
    children: ['pediatrician'],
    mental: ['psychiatrist'],
    depression: ['psychiatrist'],
    anxiety: ['psychiatrist'],
  };
  const mapDiseaseToSpecialties = (query) => {
    const lower = query.toLowerCase();
    const specialties = new Set();
    for (const [disease, specs] of Object.entries(DISEASE_TO_SPECIALTY)) {
      if (lower.includes(disease)) {
        specs.forEach((s) => specialties.add(s));
      }
    }
    return Array.from(specialties);
  };
  const visibleDoctors = useMemo(() => {
    if (!query) return data.doctors;
    const mappedSpecialties = mapDiseaseToSpecialties(query);
    return data.doctors.filter((d) => {
      const doctorText = `${d.name} ${d.specialty} ${d.hospital}`.toLowerCase();
      if (doctorText.includes(query.toLowerCase())) return true;
      if (mappedSpecialties.length > 0 && mappedSpecialties.includes(d.specialty.toLowerCase())) return true;
      return false;
    });
  }, [data.doctors, query]);
  const notify = (message) => { setToast(message); setTimeout(() => setToast(''), 2800); };
  const setRoleAndLogin = (nextRole, userId) => {
    const roleUserIds = { PATIENT: 'patient-1', DOCTOR: 'doctor-1', HOSPITAL: 'user-hospital-1', DONOR: 'donor-1' };
    const resolvedUserId = userId || roleUserIds[nextRole] || data.user.id;
    const resolvedName = nextRole === 'PATIENT' ? 'Ayesha Khan' : nextRole === 'DOCTOR' ? 'Dr. Sara Malik' : nextRole === 'HOSPITAL' ? 'XYZ Hospital' : 'Ali Hassan';
    setRole(nextRole);
    setData((old) => ({ ...old, user: { ...old.user, id: resolvedUserId, role: nextRole, name: resolvedName } }));
    setLogin(true);
    setScreen('home');
  };
  const handleAuthSubmit = () => {
    const resolvedRole = authForm.role || 'PATIENT';
    const resolvedName = authForm.fullName.trim() || roles[resolvedRole];
    const resolvedEmail = authForm.email.trim() || `${resolvedRole.toLowerCase()}@demo.com`;
    const roleUserIds = { PATIENT: 'patient-1', DOCTOR: 'doctor-1', HOSPITAL: 'user-hospital-1', DONOR: 'donor-1' };
    const resolvedUserId = roleUserIds[resolvedRole] || data.user.id;
    setRole(resolvedRole);
    setData((old) => ({ ...old, user: { ...old.user, id: resolvedUserId, role: resolvedRole, name: resolvedName, email: resolvedEmail } }));
    setLogin(true);
    setScreen('home');
    notify(authMode === 'signup' ? 'Account created successfully' : 'Welcome back');
  };
  const follow = (hospitalId) => { setData((old) => ({ ...old, hospitals: old.hospitals.map((h) => h.id === hospitalId ? { ...h, followed: !h.followed, followers: h.followed ? h.followers - 1 : h.followers + 1 } : h) })); notify('Hospital following updated'); };
  const getConnectionStatus = (doctorId) => { const patientId = data.user.id; const conn = data.connections.find((c) => c.patientId === patientId && c.doctorId === doctorId); return conn ? conn.status : CONNECTION_STATUS.NOT_CONNECTED; };
  const connectDoctor = (doctorId) => { const patientId = data.user.id; const existing = data.connections.find((c) => c.patientId === patientId && c.doctorId === doctorId); if (!existing || existing.status === CONNECTION_STATUS.REJECTED) { setData((old) => ({ ...old, connections: [...old.connections, { id: `conn-${Date.now()}`, patientId, doctorId, status: CONNECTION_STATUS.PENDING, createdAt: new Date().toISOString(), acceptedAt: null, rejectedAt: null }] })); notify('Connection request sent'); } else if (existing.status === CONNECTION_STATUS.PENDING) { notify('Connection pending'); } else if (existing.status === CONNECTION_STATUS.ACCEPTED) { notify('Already connected'); } };
  const acceptConnection = (connectionId) => { setData((old) => ({ ...old, connections: old.connections.map((c) => c.id === connectionId ? { ...c, status: CONNECTION_STATUS.ACCEPTED, acceptedAt: new Date().toISOString(), rejectedAt: null } : c), notifications: [{ id: `n-${Date.now()}`, type: 'MESSAGE', title: 'Connection accepted', body: 'The doctor has accepted your connection request. You can now message directly.', read: false }, ...old.notifications] })); notify('Connection accepted'); };
  const rejectConnection = (connectionId) => { setData((old) => ({ ...old, connections: old.connections.map((c) => c.id === connectionId ? { ...c, status: CONNECTION_STATUS.REJECTED, rejectedAt: new Date().toISOString(), acceptedAt: null } : c) })); notify('Connection rejected'); };
  const createRequest = () => { const request = { id: `b-${Date.now()}`, hospitalId: 'h-xyz', bloodGroup: 'B+', units: 2, urgency: 'URGENT', status: 'ACTIVE', location: 'Islamabad', title: 'B+ blood needed', responses: 0 }; const followers = data.hospitals.filter((h) => h.followed); const notices = followers.map((h, i) => ({ id: `n-${Date.now()}-${i}`, type: 'BLOOD_REQUEST', title: 'Blood request', body: `${h.name} needs B+ blood. 2 units are required.`, read: false, requestId: request.id })); setData((old) => ({ ...old, requests: [request, ...old.requests], notifications: [...notices, ...old.notifications] })); notify(`Published. ${notices.length} follower notification${notices.length === 1 ? '' : 's'} created.`); setScreen('blood'); };
  const help = (request) => { if (data.responses.some((r) => r.requestId === request.id && r.donorId === data.user.id)) return notify('Your response is already with the hospital.'); const response = { id: `r-${Date.now()}`, requestId: request.id, donorId: data.user.id, name: data.user.name, status: 'OFFERED' }; setData((old) => ({ ...old, responses: [response, ...old.responses], requests: old.requests.map((r) => r.id === request.id ? { ...r, responses: r.responses + 1 } : r), notifications: [{ id: `n-${Date.now()}`, type: 'BLOOD_REQUEST', title: 'Offer sent to hospital', body: 'The coordination team received your offer to help.', read: false }, ...old.notifications] })); notify('Thank you. Your offer was sent to the hospital.'); setSelectedRequest({ ...request, responses: request.responses + 1 }); };
  const book = (doctor) => { if (data.appointments.some((appointment) => appointment.doctor === doctor.name && appointment.date === 'Thu, 08 Oct')) return notify('This appointment slot is no longer available.'); const appointment = { id: `a-${Date.now()}`, doctor: doctor.name, hospital: doctor.hospital, date: 'Thu, 08 Oct', time: '10:30 AM', status: 'Pending' }; setData((old) => ({ ...old, appointments: [appointment, ...old.appointments], notifications: [{ id: `n-${Date.now()}`, type: 'FOLLOW_UP', title: 'Follow-up reminder scheduled', body: 'A reminder will appear 14 days after your appointment.', read: false }, { id: `n-${Date.now()}`, type: 'APPOINTMENT', title: 'Appointment requested', body: `Your appointment with ${doctor.name} is pending confirmation.`, read: false }, ...old.notifications] })); notify('Appointment requested'); setScreen('appointments'); };
  const processReport = () => { const report = { id: `r-${Date.now()}`, name: 'Blood test report.pdf', status: 'Processed', summary: 'Ø¢Ù¾ Ú©ÛŒ Ø±Ù¾ÙˆØ±Ù¹ Ù…ÛŒÚº Ú†Ù†Ø¯ Ù†ØªØ§Ø¦Ø¬ ÚˆØ§Ú©Ù¹Ø± Ú©Û’ Ø³Ø§ØªÚ¾ Ø¨Ø§Øª Ú©Ø±Ù†Û’ Ú©Û’ Ù‚Ø§Ø¨Ù„ ÛÛŒÚºÛ”', findings: 'Haemoglobin and glucose values are highlighted for professional review.', shared: false }; setData((old) => ({ ...old, reports: [report, ...old.reports], notifications: [{ id: `n-${Date.now()}`, type: 'REPORT', title: 'Report processed', body: 'Your AI-assisted summary is ready to review.', read: false }, ...old.notifications] })); notify('Report processed with a safety disclaimer'); setScreen('reports'); };
  const shareReport = (reportId) => { setData((old) => ({ ...old, reports: old.reports.map((report) => report.id === reportId ? { ...report, shared: true } : report), notifications: [{ id: `n-${Date.now()}`, type: 'REPORT', title: 'Report shared with doctor', body: 'Dr. Sara Malik can now view your original report and summary.', read: false }, ...old.notifications] })); notify('Report shared explicitly with doctor'); };
  const processPrescription = () => { setPrescription({ medicine: 'Metformin', strength: '500 mg', dose: '1 tablet', frequency: 'Twice daily', duration: '30 days', confidence: '92%', price: 'Demo Price: PKR 180', source: 'Demo pharmacy catalogue' }); notify('Prescription scanned. Verify medicines with your pharmacist.'); setScreen('prescription'); };
  const createPost = () => { const post = { id: `p-${Date.now()}`, hospitalId: 'h-xyz', title: 'New care team update', body: 'Our care team has published a new community update for patients and followers.', type: 'General update', time: 'Just now' }; setData((old) => ({ ...old, posts: [post, ...old.posts], notifications: [{ id: `n-${Date.now()}`, type: 'HOSPITAL_POST', title: 'New hospital update', body: 'XYZ Hospital shared a new update with its community.', read: false }, ...old.notifications] })); notify('Hospital update published'); setScreen('hospital'); };
  const markRead = () => setData((old) => ({ ...old, notifications: old.notifications.map((n) => ({ ...n, read: true })) }));
  const fulfill = (requestId) => { setData((old) => ({ ...old, requests: old.requests.map((r) => r.id === requestId ? { ...r, status: 'FULFILLED' } : r) })); notify('Request marked fulfilled. New notifications are stopped.'); };

  if (!login) return <Login onLogin={setRoleAndLogin} authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm} onSubmit={handleAuthSubmit} />;
  let content = <Home role={role} data={data} setScreen={setScreen} setSelectedHospital={setSelectedHospital} setSelectedDoctor={setSelectedDoctor} setSelectedRequest={setSelectedRequest} notify={notify} onCreatePost={createPost} />;
  if (screen === 'search') content = <Search query={query} setQuery={setQuery} radius={radius} setRadius={setRadius} doctors={visibleDoctors} setSelectedDoctor={setSelectedDoctor} setScreen={setScreen} />;
  if (screen === 'doctor') content = <Doctor doctor={selectedDoctor || data.doctors[0]} onBack={() => setScreen('search')} onBook={book} notify={notify} getConnectionStatus={getConnectionStatus} connectDoctor={connectDoctor} role={role} setScreen={setScreen} />;
  if (screen === 'appointments') content = <Appointments data={data} onBack={() => setScreen('home')} />;
  if (screen === 'messages') content = <Messages data={data} onBack={() => setScreen('home')} notify={notify} role={role} getConnectionStatus={getConnectionStatus} />;
  if (screen === 'reports') content = <Reports data={data} onBack={() => setScreen('home')} onProcess={processReport} onShare={shareReport} />;
  if (screen === 'prescription') content = <Prescription prescription={prescription} onBack={() => setScreen('home')} onProcess={processPrescription} />;
  if (screen === 'blood') content = <Blood data={data} role={role} onBack={() => setScreen('home')} setSelectedRequest={setSelectedRequest} setScreen={setScreen} onHelp={help} onCreate={createRequest} onFulfill={fulfill} />;
  if (screen === 'hospital') content = <Hospital hospital={currentHospital} data={data} onBack={() => setScreen('home')} onFollow={follow} setSelectedRequest={setSelectedRequest} setScreen={setScreen} />;
  if (screen === 'request') content = <Request request={selectedRequest || data.requests[0]} data={data} onBack={() => setScreen('blood')} onHelp={help} />;
  if (screen === 'notifications') content = <Notifications data={data} onBack={() => setScreen('home')} onRead={markRead} setSelectedRequest={setSelectedRequest} setScreen={setScreen} />;
  if (screen === 'profile') content = <Profile role={role} data={data} onRole={setRoleAndLogin} onLogout={() => setLogin(false)} />;
  if (screen === 'patients') content = <DoctorPatients data={data} onBack={() => setScreen('home')} notify={notify} onAccept={acceptConnection} onReject={rejectConnection} setScreen={setScreen} />;
  return <SafeAreaView style={styles.app}><StatusBar barStyle="dark-content" backgroundColor={colors.bg} />{content}<Nav role={role} screen={screen} setScreen={setScreen} unread={data.notifications.filter((n) => !n.read).length} />{toast && <View style={styles.toast}><Icon name="checkmark-circle" size={18} color={colors.white} /><Text style={styles.toastText}>{toast}</Text></View>}</SafeAreaView>;
}

function Login({ onLogin, authMode, setAuthMode, authForm, setAuthForm, onSubmit }) {
  const updateField = (field, value) => setAuthForm((current) => ({ ...current, [field]: value }));
  const isSignup = authMode === 'signup';

  return <SafeAreaView style={styles.app}><View style={styles.login}><View style={styles.brandMark}><Icon name="medical" size={32} color={colors.white} /></View><Text style={styles.brand}>Nexcure</Text><Text style={styles.loginTitle}>{isSignup ? 'Create your account' : 'Welcome back'}</Text><Text style={styles.loginCopy}>{isSignup ? 'Set up a care profile and start helping patients, doctors and hospitals.' : 'Sign in to your healthcare workspace and continue your care journey.'}</Text>
    <View style={styles.tabRow}><TouchableOpacity style={[styles.authTab, !isSignup && styles.authTabActive]} onPress={() => setAuthMode('login')}><Text style={[styles.authTabText, !isSignup && styles.authTabTextActive]}>Login</Text></TouchableOpacity><TouchableOpacity style={[styles.authTab, isSignup && styles.authTabActive]} onPress={() => setAuthMode('signup')}><Text style={[styles.authTabText, isSignup && styles.authTabTextActive]}>Create account</Text></TouchableOpacity></View>
    <Card style={styles.loginCard}>
      {isSignup && <TextInput value={authForm.fullName} onChangeText={(value) => updateField('fullName', value)} placeholder="Full name" placeholderTextColor={colors.muted} style={styles.input} />}
      <TextInput value={authForm.email} onChangeText={(value) => updateField('email', value)} autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor={colors.muted} style={styles.input} />
      <TextInput value={authForm.password} onChangeText={(value) => updateField('password', value)} secureTextEntry placeholder="Password" placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.fieldLabel}>Role</Text>
      <View style={styles.roleGrid}>{Object.keys(roles).map((r) => <TouchableOpacity key={r} onPress={() => updateField('role', r)} style={[styles.pill, authForm.role === r && styles.pillActive]}><Text style={[styles.pillText, authForm.role === r && styles.pillTextActive]}>{roles[r]}</Text></TouchableOpacity>)}</View>
      <TouchableOpacity accessibilityRole="button" onPress={onSubmit} style={styles.primaryAuthButton}><Text style={styles.primaryAuthText}>{isSignup ? 'Create account' : 'Sign in'}</Text></TouchableOpacity>
      <Text style={styles.loginFoot}>Demo access: {Object.keys(roles).map((r) => roles[r]).join(' Â· ')}</Text>
    </Card>
    <Text style={styles.separatorText}>Quick demo roles</Text>
    <View style={styles.quickDemoList}>{Object.keys(roles).map((r) => <TouchableOpacity key={r} style={styles.roleButton} onPress={() => onLogin(r)}><View style={styles.roleIcon}><Icon name={r === 'HOSPITAL' ? 'business' : r === 'DOCTOR' ? 'person' : r === 'DONOR' ? 'water' : 'heart'} size={19} color={colors.teal} /></View><Text style={styles.roleText}>Continue as {roles[r]}</Text><Icon name="chevron-forward" size={18} color={colors.muted} /></TouchableOpacity>)}</View>
  </View></SafeAreaView>;
}
function Home({ role, data, setScreen, setSelectedHospital, setSelectedDoctor, setSelectedRequest, onCreatePost }) { const user = data.user; const isHospital = role === 'HOSPITAL'; const isDonor = role === 'DONOR'; const isDoctor = role === 'DOCTOR'; return <><ScrollView contentContainerStyle={styles.scroll}><View style={styles.homeTop}><View><Text style={styles.greeting}>Good morning,</Text><Text style={styles.name}>{user.name}</Text></View><TouchableOpacity onPress={() => setScreen('notifications')} style={styles.iconButton}><Icon name="notifications-outline" size={23} color={colors.ink} />{data.notifications.some((n) => !n.read) && <View style={styles.dot} />}</TouchableOpacity></View>{!isHospital && !isDoctor && <View style={styles.searchBox}><Icon name="search" size={20} color={colors.muted} /><TextInput placeholder="Search disease or tumor..." placeholderTextColor={colors.muted} style={styles.searchInput} onFocus={() => setScreen('search')} /></View>}{isHospital ? <HospitalHome data={data} setScreen={setScreen} onCreate={() => setScreen('blood')} onCreatePost={onCreatePost} /> : isDoctor ? <DoctorHome data={data} setScreen={setScreen} /> : isDonor ? <DonorHome data={data} setScreen={setScreen} setSelectedRequest={setSelectedRequest} /> : <PatientHome data={data} setScreen={setScreen} setSelectedHospital={setSelectedHospital} setSelectedDoctor={setSelectedDoctor} />}</ScrollView></>; }
function PatientHome({ data, setScreen, setSelectedHospital, setSelectedDoctor }) { return <><View style={styles.quickGrid}>{[['Find Doctor', 'people', 'search'], ['Find Hospital', 'business', 'hospital'], ['Book appointment', 'calendar', 'appointments'], ['Upload report', 'document-text', 'reports'], ['Scan prescription', 'scan', 'prescription'], ['Blood support', 'water', 'blood']].map(([label, icon, target]) => <TouchableOpacity key={label} style={styles.quick} onPress={() => setScreen(target)}><View style={styles.quickIcon}><Icon name={icon} size={19} color={colors.teal} /></View><Text style={styles.quickText}>{label}</Text></TouchableOpacity>)}</View><Section title="Upcoming appointment" action="View all" onAction={() => setScreen('appointments')}>{data.appointments.length ? <AppointmentCard appointment={data.appointments[0]} /> : <Card><Text style={styles.emptyTitle}>Your care calendar is clear</Text><Text style={styles.muted}>Book a specialist when you are ready.</Text><Button title="Find a doctor" icon="search" onPress={() => setScreen('search')} /></Card>}</Section><Section title="Recent reports" action="Open" onAction={() => setScreen('reports')}>{data.reports.length ? <ReportMini report={data.reports[0]} /> : <Text style={styles.muted}>Your processed reports will appear here.</Text>}</Section><Section title="Nearby specialists" action="See all" onAction={() => setScreen('search')}>{data.doctors.slice(0, 2).map((d) => <TouchableOpacity key={d.id} onPress={() => { setSelectedDoctor(d); setScreen('doctor'); }}><DoctorCard doctor={d} /></TouchableOpacity>)}</Section><Section title="Hospital updates" action="Explore" onAction={() => { setSelectedHospital(data.hospitals[0]); setScreen('hospital'); }}>{data.hospitals.slice(0, 2).map((h) => <TouchableOpacity key={h.id} onPress={() => { setSelectedHospital(h); setScreen('hospital'); }}><HospitalCard hospital={h} /></TouchableOpacity>)}</Section></>; }

function DoctorHome({ data, setScreen }) { const pending = data.appointments.filter((a) => a.status === 'Pending'); return <><View style={styles.impactBanner}><View><Text style={styles.bannerEyebrow}>DOCTOR WORKSPACE</Text><Text style={styles.bannerTitle}>Your patients, appointments and reports.</Text></View><Icon name="medical" size={34} color={colors.white} /></View><View style={styles.statsRow}>{[['Appointments', String(data.appointments.length)], ['Pending', String(pending.length)], ['Reports', String(data.reports.filter((r) => r.shared).length)]].map(([label, value]) => <Card key={label} style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></Card>)}</View><Section title="Today"><Card><Text style={styles.cardTitle}>{pending.length ? `${pending.length} appointment request(s)` : 'Your schedule is clear'}</Text><Text style={styles.muted}>Review appointments and shared reports from this workspace.</Text><Button title="View patients" icon="people" onPress={() => setScreen('patients')} /></Card></Section><Section title="Messages" action="Open" onAction={() => setScreen('messages')}><Card><Text style={styles.cardTitle}>{data.messages.length} conversation(s)</Text><Text style={styles.muted}>Respond to patients and keep care coordinated.</Text></Card></Section></>; }
function DonorHome({ data, setScreen, setSelectedRequest }) { const active = data.requests.filter((r) => r.status === 'ACTIVE'); return <><View style={styles.impactBanner}><View><Text style={styles.bannerEyebrow}>YOUR IMPACT</Text><Text style={styles.bannerTitle}>{data.responses.length + 2} people helped through Nexcure</Text></View><Icon name="heart" size={34} color={colors.white} /></View><Section title="Urgent blood requests" action="View all" onAction={() => setScreen('blood')}>{active.slice(0, 2).map((r) => <TouchableOpacity key={r.id} onPress={() => { setSelectedRequest(r); setScreen('request'); }}><BloodCard request={r} /></TouchableOpacity>)}</Section><Section title="Followed hospitals"><Text style={styles.muted}>New posts from hospitals you follow will appear here.</Text></Section></>; }
function HospitalHome({ data, setScreen, onCreate, onCreatePost }) { const active = data.requests.filter((r) => r.status === 'ACTIVE'); return <><View style={styles.impactBanner}><View><Text style={styles.bannerEyebrow}>HOSPITAL WORKSPACE</Text><Text style={styles.bannerTitle}>Care coordination, in one place.</Text></View><Icon name="business" size={34} color={colors.white} /></View><View style={styles.statsRow}>{[['Followers', '12.4k'], ['Active requests', String(active.length)], ['Responses', String(data.responses.length)]].map(([label, value]) => <Card key={label} style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></Card>)}</View><Section title="Blood coordination" action="Open" onAction={() => setScreen('blood')}><Card><Text style={styles.cardTitle}>Need to reach your donor community?</Text><Text style={styles.muted}>Publish an urgent request and every active follower is notified immediately.</Text><Button title="Create blood request" icon="add-circle" onPress={onCreate} /></Card></Section><Section title="Community updates"><Card><Text style={styles.cardTitle}>Keep followers informed</Text><Text style={styles.muted}>Share a care update with the hospital community.</Text><Button title="Publish update" icon="megaphone" variant="secondary" onPress={onCreatePost} /></Card></Section><Section title="Recent activity"><Card><Text style={styles.cardTitle}>XYZ Hospital</Text><Text style={styles.muted}>Your team has {data.responses.length} donor response(s) to coordinate.</Text></Card></Section></>; }
function Nav({ role, screen, setScreen, unread }) { const items = role === 'HOSPITAL' ? [['home', 'Home'], ['calendar', 'Appointments'], ['water', 'Blood'], ['notifications', 'Alerts'], ['person', 'Profile']] : role === 'DOCTOR' ? [['home', 'Home'], ['calendar', 'Appointments'], ['people', 'Patients'], ['chatbubbles', 'Messages'], ['person', 'Profile']] : role === 'DONOR' ? [['home', 'Home'], ['water', 'Requests'], ['business', 'Hospitals'], ['notifications', 'Alerts'], ['person', 'Profile']] : [['home', 'Home'], ['search', 'Search'], ['calendar', 'Appointments'], ['chatbubbles', 'Messages'], ['person', 'Profile']]; return <View style={styles.nav}>{items.map(([icon, label]) => { const key = label === 'Requests' || label === 'Blood' ? 'blood' : label === 'Hospitals' ? 'hospital' : label === 'Alerts' ? 'notifications' : label.toLowerCase(); return <TouchableOpacity key={label} style={styles.navItem} onPress={() => setScreen(key)}><Icon name={icon} size={21} color={screen === key ? colors.teal : colors.muted} /><Text style={[styles.navText, screen === key && styles.navActive]}>{label}</Text>{label === 'Alerts' && unread > 0 && <View style={styles.navDot} />}</TouchableOpacity>; })}</View>; }
function Search({ query, setQuery, radius, setRadius, doctors, setSelectedDoctor, setScreen }) { const [area, setArea] = useState('Islamabad'); return <><ScrollView contentContainerStyle={styles.scroll}><Header title="Find care" subtitle="Search without assuming a diagnosis" /><View style={styles.searchBox}><Icon name="search" size={20} color={colors.muted} /><TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search disease or tumor" placeholderTextColor={colors.muted} style={styles.searchInput} /></View><View style={styles.locationRow}><Icon name="location" size={18} color={colors.teal} /><Text style={styles.locationText}>{area}</Text><TouchableOpacity onPress={() => setArea(area === 'Islamabad' ? 'Rawalpindi' : 'Islamabad')}><Text style={styles.link}>Change area</Text></TouchableOpacity><TouchableOpacity onPress={() => setArea('Islamabad')}><Text style={styles.link}>Use current</Text></TouchableOpacity></View><View style={styles.chips}>{[10, 15, 20, 25].map((r) => <TouchableOpacity key={r} onPress={() => setRadius(r)} style={[styles.chip, radius === r && styles.activeChip]}><Text style={[styles.chipText, radius === r && styles.activeChipText]}>{r} km</Text></TouchableOpacity>)}</View><Text style={styles.searchNote}>Results are relevant to your search, not a diagnosis. Manual area selection works without location permission.</Text><Section title={`Relevant doctors (${doctors.length})`}>{doctors.map((d) => <TouchableOpacity key={d.id} onPress={() => { setSelectedDoctor(d); setScreen('doctor'); }}><DoctorCard doctor={d} /></TouchableOpacity>)}{!doctors.length && <EmptyState title="No doctors found" copy="Try a broader search or increase your radius." />}</Section></ScrollView></>; }
function Doctor({ doctor, onBack, onBook, notify, getConnectionStatus, connectDoctor, role, setScreen }) {
  const isPatient = role === 'PATIENT';
  const connectionStatus = isPatient ? getConnectionStatus(doctor.id) : null;
  const isAccepted = connectionStatus === CONNECTION_STATUS.ACCEPTED;
  const isPending = connectionStatus === CONNECTION_STATUS.PENDING;
  const isRejected = connectionStatus === CONNECTION_STATUS.REJECTED;

  const renderConnectButton = () => {
    if (!isPatient) return null;
    if (isPending) {
      return <Button title="Connection Pending" icon="time" variant="secondary" onPress={() => notify('Connection request sent to doctor.')} />;
    }
    if (isAccepted) {
      return <Button title="Connected" icon="checkmark-circle" variant="secondary" onPress={() => { notify('You are connected'); setScreen('messages'); }} />;
    }
    if (isRejected) {
      return <Button title="Connect" icon="person-add" onPress={() => connectDoctor(doctor.id)} />;
    }
    return <Button title="Connect" icon="person-add" onPress={() => connectDoctor(doctor.id)} />;
  };

  const renderMessageButton = () => {
    if (!isPatient) return null;
    return isAccepted ? (
      <Button title="Message" icon="chatbubble-ellipses" onPress={() => { notify('Open conversation'); setScreen('messages'); }} />
    ) : (
      <Button title="Messaging locked" icon="lock-closed" variant="secondary" onPress={() => notify(isPending ? 'Messaging opens after the doctor accepts your connection.' : isRejected ? 'Connect with the doctor first to unlock messaging.' : 'Send a connection request to unlock messaging.')} />
    );
  };

  return <ScrollView contentContainerStyle={styles.scroll}><Header title="Doctor profile" onBack={onBack} />
    <View style={styles.profileHero}>
      <Avatar letter={doctor.name.slice(4, 5) || 'D'} large />
      <Text style={styles.profileName}>{doctor.name}</Text>
      <View style={styles.inline}><Badge>VERIFIED</Badge><Text style={styles.muted}>  {doctor.specialty}</Text></View>
      <Text style={styles.rating}>â˜… {doctor.rating} <Text style={styles.muted}>  86 reviews  Â·  {doctor.distance}</Text></Text>
      {isPatient && connectionStatus === CONNECTION_STATUS.NOT_CONNECTED && <Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>New to Nexcure? Send a connection request to start a professional dialogue.</Text>}
      {isPatient && isPending && <Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>Waiting for doctor to accept your request.</Text>}
      {isPatient && isAccepted && <Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>Connected. You can now communicate privately.</Text>}
      {isPatient && isRejected && <Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>Your request was not accepted. You can send a new request.</Text>}
    </View>
    <Card><Text style={styles.cardTitle}>About</Text><Text style={styles.muted}>Experienced specialist focused on clear explanations, collaborative care and practical next steps for every patient.</Text></Card>
    <Card><Text style={styles.cardTitle}>Experience &amp; Location</Text><Text style={styles.muted}>{doctor.name} Â· {doctor.specialty} Â· {doctor.hospital} Â· {doctor.distance}</Text></Card>
    <Section title="Available slots">
      <View style={styles.slotRow}>
        {['Today 4:00 PM', 'Thu 10:30 AM', 'Fri 2:00 PM'].map((slot) => <TouchableOpacity key={slot} style={styles.slot} onPress={() => notify(`${slot} selected`)}><Text style={styles.slotText}>{slot}</Text></TouchableOpacity>)}
      </View>
    </Section>
    {isPatient ? (
      <>
        {renderConnectButton()}
        {renderMessageButton()}
        <Text style={styles.disclaimer}>Messaging is only available after your connection is accepted.</Text>
      </>
    ) : (
      <Button title="Book appointment" icon="calendar" onPress={() => onBook(doctor)} />
    )}
  </ScrollView>;
}
function Appointments({ data, onBack }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Appointments" subtitle="Your upcoming care" onBack={onBack} />{data.appointments.length ? data.appointments.map((a) => <AppointmentCard key={a.id} appointment={a} />) : <EmptyState title="No appointments yet" copy="When you book a doctor, appointments will appear here." />}</ScrollView>; }
function Messages({ data, onBack, notify, role, getConnectionStatus }) {
  const acceptedConnections = (data.connections || []).filter((c) => c.status === CONNECTION_STATUS.ACCEPTED && c.patientId === data.user.id);
  const pendingConnections = (data.connections || []).filter((c) => c.status === CONNECTION_STATUS.PENDING && c.patientId === data.user.id);
  const rejectedConnections = (data.connections || []).filter((c) => c.status === CONNECTION_STATUS.REJECTED && c.patientId === data.user.id);
  const canMessage = acceptedConnections.length > 0;
  const isPatient = role === 'PATIENT';

  return <ScrollView contentContainerStyle={styles.scroll}>
    <Header title="Messages" subtitle="Secure conversations with your care team" onBack={onBack} />
    {isPatient && pendingConnections.length > 0 && (
      <Card style={styles.reportShare}>
        <Icon name="time" size={22} color={colors.amber} />
        <Text style={styles.muted}>Messaging remains locked while your connection request is pending.</Text>
      </Card>
    )}
    {isPatient && rejectedConnections.length > 0 && (
      <Card style={styles.reportShare}>
        <Icon name="close-circle" size={22} color={colors.red} />
        <Text style={styles.muted}>Messaging is unavailable â€” your connection was not accepted.</Text>
      </Card>
    )}
    {isPatient && !canMessage && (
      <Card style={styles.reportShare}>
        <Icon name="lock-closed" size={22} color={colors.muted} />
        <Text style={styles.muted}>Send a connection request from a doctor's profile to unlock private messaging.</Text>
      </Card>
    )}
    {data.messages.map((m) => <TouchableOpacity key={m.id} onPress={() => canMessage ? notify('Message composer ready') : notify('Messaging requires an accepted connection')}><Card style={[styles.messageRow, !canMessage && styles.lockedCard]}><Avatar letter={m.doctor.slice(4, 5) || 'D'} /><View style={styles.messageBody}><View style={styles.messageTop}><Text style={styles.cardTitle}>{m.doctor}</Text><Text style={styles.time}>{m.time}</Text></View><Text style={[styles.muted, !canMessage && { opacity: 0.5 }]}>{m.text}</Text><Text style={styles.messageAction}>{canMessage ? 'Open conversation  â€º' : 'Messaging locked  â€º'}</Text></View>{m.unread && <View style={styles.unread} />}</Card></TouchableOpacity>)}
    {isPatient && (
      <Section title="Connection status">
        <Card><Text style={styles.cardTitle}>Pending: {pendingConnections.length}</Text><Text style={styles.muted}>Waiting for doctor acceptance.</Text></Card>
        <Card><Text style={styles.cardTitle}>Accepted: {acceptedConnections.length}</Text><Text style={styles.muted}>Ready for messaging and report sharing.</Text></Card>
        <Card><Text style={styles.cardTitle}>Rejected: {rejectedConnections.length}</Text><Text style={styles.muted}>Connect with another doctor to start communicating.</Text></Card>
      </Section>
    )}
    {!isPatient && <Card style={styles.reportShare}><Icon name="shield-checkmark" size={22} color={colors.teal} /><Text style={styles.muted}>Reports are only shared when you explicitly choose a doctor.</Text></Card>}
  </ScrollView>; }
function Reports({ data, onBack, onProcess, onShare }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Medical reports" subtitle="Understand your records, with your doctor" onBack={onBack} /><Card style={styles.uploadCard}><Icon name="cloud-upload" size={30} color={colors.teal} /><Text style={styles.cardTitle}>Add a report</Text><Text style={styles.muted}>PDF, JPG, JPEG or PNG. Your original always remains available.</Text><Button title="Upload demo report" icon="add" onPress={onProcess} /></Card>{data.reports.map((r) => <Card key={r.id}><View style={styles.rowBetween}><View><Text style={styles.cardTitle}>{r.name}</Text><Badge tone="green">{r.status}</Badge></View><Icon name="document-text" size={25} color={colors.teal} /></View><Text style={styles.urdu}>{r.summary}</Text><Text style={styles.finding}>{r.findings}</Text><Text style={styles.disclaimer}>AI-generated information is not a diagnosis or substitute for professional medical advice.</Text><Button title={r.shared ? 'Shared with doctor' : 'Share with doctor'} icon="share-social" variant={r.shared ? 'secondary' : 'primary'} onPress={() => onShare(r.id)} /></Card>)}{!data.reports.length && <EmptyState title="No reports yet" copy="Upload a demo report to see extraction and an Urdu summary." />}</ScrollView>; }

function Prescription({ prescription, onBack, onProcess }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Prescription scan" subtitle="Extract medicine information carefully" onBack={onBack} /><Card style={styles.uploadCard}><Icon name="scan" size={30} color={colors.teal} /><Text style={styles.cardTitle}>{prescription ? 'Scan complete' : 'Scan a prescription'}</Text><Text style={styles.muted}>Use a camera or gallery image in production. The demo keeps uncertain OCR clearly labelled.</Text><Button title={prescription ? 'Scan another demo' : 'Scan demo prescription'} icon="camera" onPress={onProcess} /></Card>{prescription && <><Card><View style={styles.rowBetween}><Text style={styles.cardTitle}>{prescription.medicine}</Text><Badge tone="green">{prescription.confidence} CONFIDENCE</Badge></View><View style={styles.requestGrid}><Info label="Strength" value={prescription.strength} /><Info label="Dose" value={prescription.dose} /><Info label="Frequency" value={prescription.frequency} /><Info label="Duration" value={prescription.duration} /></View></Card><Card><Text style={styles.cardTitle}>Medicine price information</Text><Text style={styles.muted}>{prescription.price}</Text><Text style={styles.muted}>{prescription.source}  Â·  Not a current market quote</Text></Card><Text style={styles.disclaimer}>Verify every extracted medicine, strength and dose with your doctor or pharmacist before use.</Text></>}</ScrollView>; }

function ReportMini({ report }) { return <Card><View style={styles.rowBetween}><Text style={styles.cardTitle}>{report.name}</Text><Badge tone="green">{report.status}</Badge></View><Text style={styles.muted}>{report.findings}</Text></Card>; }

function DoctorPatients({ data, onBack, notify, onAccept, onReject }) {
  const pendingConnections = data.connections.filter((c) => c.status === CONNECTION_STATUS.PENDING);
  const acceptedConnections = data.connections.filter((c) => c.status === CONNECTION_STATUS.ACCEPTED);
  const [tab, setTab] = useState('pending');
  return <ScrollView contentContainerStyle={styles.scroll}><Header title="Patients" subtitle="Connection requests and shared care information" onBack={onBack} />
    <View style={styles.tabRow}>
      <TouchableOpacity style={[styles.tab, tab === 'pending' && styles.tabActive]} onPress={() => setTab('pending')}>
        <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>Requests ({pendingConnections.length})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, tab === 'accepted' && styles.tabActive]} onPress={() => setTab('accepted')}>
        <Text style={[styles.tabText, tab === 'accepted' && styles.tabTextActive]}>Connected ({acceptedConnections.length})</Text>
      </TouchableOpacity>
    </View>
    {tab === 'pending' && (
      <>
        {pendingConnections.map((conn) => {
          const patient = data.patients?.find((p) => p.id === conn.patientId);
          return <Card key={conn.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>{patient?.name || conn.patientId}</Text>
                <Text style={styles.muted}>{patient?.diseaseDetails || 'New connection request'}</Text>
                <Text style={styles.time}>Sent {new Date(conn.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.inline}>
                <Button title="Accept" icon="checkmark" onPress={() => { onAccept(conn.id); notify('Connection accepted â€” messaging unlocked'); }} />
                <Button title="Reject" icon="close" variant="danger" onPress={() => { onReject(conn.id); notify('Connection rejected'); }} />
              </View>
            </View>
          </Card>;
        })}
        {!pendingConnections.length && <EmptyState title="No pending requests" copy="Connection requests from patients will appear here." />}
      </>
    )}
    {tab === 'accepted' && (
      <>
        {acceptedConnections.map((conn) => {
          const patient = data.patients?.find((p) => p.id === conn.patientId);
          return <TouchableOpacity key={conn.id} onPress={() => { notify('View patient chat'); setScreen('messages'); }}>
            <Card>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>{patient?.name || conn.patientId}</Text>
                  <Text style={styles.muted}>Connected since {conn.acceptedAt ? new Date(conn.acceptedAt).toLocaleDateString() : ''}</Text>
                </View>
                <Icon name="chevron-forward" size={19} color={colors.muted} />
              </View>
            </Card>
          </TouchableOpacity>;
        })}
        {!acceptedConnections.length && <EmptyState title="No connected patients" copy="Accepted connections will appear here." />}
      </>
    )}
    <Section title="Shared reports">
      <Card><Text style={styles.muted}>{data.reports.filter((r) => r.shared).length} report(s) explicitly shared with your care team.</Text></Card>
      {data.reports.filter((r) => r.shared).map((report) => <Card key={report.id}><Text style={styles.cardTitle}>{report.name}</Text><Text style={styles.urdu}>{report.summary}</Text><Button title="Open report" icon="document-text" variant="secondary" onPress={() => notify('Original report and summary opened')} /></Card>)}
      {!data.reports.some((r) => r.shared) && <EmptyState title="No shared reports" copy="Patients control when their original reports and summaries become visible." />}
    </Section>
  </ScrollView>;
}
function Blood({ data, role, onBack, setSelectedRequest, setScreen, onHelp, onCreate, onFulfill }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Blood support" subtitle={role === 'HOSPITAL' ? 'Coordinate requests and donor responses' : 'Urgent needs from trusted hospitals'} onBack={onBack} />{role === 'HOSPITAL' && <Button title="Create blood request" icon="add-circle" onPress={onCreate} />}{role !== 'HOSPITAL' && <View style={styles.filterRow}><Badge>ALL REQUESTS</Badge><Text style={styles.muted}>  From followed hospitals and nearby care teams</Text></View>}<Section title={role === 'HOSPITAL' ? 'Blood requests' : 'Urgent requests'}>{data.requests.map((r) => <View key={r.id}><TouchableOpacity onPress={() => { setSelectedRequest(r); setScreen('request'); }}><BloodCard request={r} hospital={data.hospitals.find((h) => h.id === r.hospitalId)} hospitalMode={role === 'HOSPITAL'} onFulfill={() => onFulfill(r.id)} /></TouchableOpacity>{role === 'HOSPITAL' && data.responses.filter((response) => response.requestId === r.id).map((response) => <Card key={response.id} style={styles.responseCard}><View style={styles.rowBetween}><Text style={styles.cardTitle}>{response.name}</Text><Badge>{response.status}</Badge></View><Text style={styles.muted}>Donor offer received for {r.bloodGroup} coordination.</Text></Card>)}</View>)}</Section></ScrollView>; }
function Request({ request, data, onBack, onHelp }) { const hospital = data.hospitals.find((h) => h.id === request.hospitalId); const already = data.responses.some((r) => r.requestId === request.id && r.donorId === data.user.id); return <ScrollView contentContainerStyle={styles.scroll}><Header title="Blood request" onBack={onBack} /><View style={styles.requestHero}><Badge tone="red">{request.status === 'ACTIVE' ? request.urgency : request.status}</Badge><Text style={styles.requestTitle}>{request.title}</Text><Text style={styles.muted}>{hospital?.name}  Â·  {request.location}</Text></View><Card><View style={styles.requestGrid}><Info label="Blood group" value={request.bloodGroup} /><Info label="Units needed" value={`${request.units} units`} /><Info label="Status" value={request.status} /><Info label="Response method" value="Hospital coordination" /></View></Card><Card><Text style={styles.cardTitle}>A message from the care team</Text><Text style={styles.muted}>Please contact the hospital coordination team after your offer is reviewed. Only information required for donation coordination is shared.</Text></Card>{request.status === 'ACTIVE' && <Button title={already ? 'Offer sent' : 'I can help'} icon={already ? 'checkmark' : 'heart'} variant={already ? 'secondary' : 'primary'} onPress={() => onHelp(request)} />}<Text style={styles.disclaimer}>Never share CNIC or private medical information in a public post.</Text></ScrollView>; }
function Notifications({ data, onBack, onRead, setSelectedRequest, setScreen }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Notifications" subtitle="Stay close to your care community" onBack={onBack} /><TouchableOpacity onPress={onRead} style={styles.markRead}><Text style={styles.link}>Mark all as read</Text></TouchableOpacity>{data.notifications.map((n) => <TouchableOpacity key={n.id} style={[styles.notification, !n.read && styles.unreadNotification]} onPress={() => { if (n.requestId) { setSelectedRequest(data.requests.find((r) => r.id === n.requestId)); setScreen('request'); } }}><View style={[styles.notificationIcon, n.type === 'BLOOD_REQUEST' && styles.bloodIcon]}><Icon name={n.type === 'BLOOD_REQUEST' ? 'water' : n.type === 'APPOINTMENT' ? 'calendar' : 'notifications'} size={19} color={n.type === 'BLOOD_REQUEST' ? colors.red : colors.teal} /></View><View style={styles.notificationBody}><Text style={styles.cardTitle}>{n.title}</Text><Text style={styles.muted}>{n.body}</Text><Text style={styles.time}>Just now</Text></View>{!n.read && <View style={styles.unread} />}</TouchableOpacity>)}</ScrollView>; }
function Hospital({ hospital, data, onBack, onFollow, setSelectedRequest, setScreen }) { const posts = data.posts.filter((p) => p.hospitalId === hospital.id); const requests = data.requests.filter((r) => r.hospitalId === hospital.id); return <ScrollView contentContainerStyle={styles.scroll}><Header title="Hospital page" onBack={onBack} /><View style={styles.hospitalHero}><View style={styles.logo}><Icon name="business" size={34} color={colors.teal} /></View><Text style={styles.profileName}>{hospital.name}  âœ“</Text><Text style={styles.muted}>{hospital.area}  Â·  {hospital.followers.toLocaleString()} followers</Text><Text style={styles.hospitalDescription}>{hospital.description}</Text><Button title={hospital.followed ? 'Following' : 'Follow hospital'} icon={hospital.followed ? 'checkmark' : 'add'} variant={hospital.followed ? 'secondary' : 'primary'} onPress={() => onFollow(hospital.id)} /></View><Section title="Posts">{posts.map((p) => <Card key={p.id}><View style={styles.rowBetween}><Badge>{p.type}</Badge><Text style={styles.time}>{p.time}</Text></View><Text style={styles.cardTitle}>{p.title}</Text><Text style={styles.muted}>{p.body}</Text></Card>)}{requests.map((r) => <TouchableOpacity key={r.id} onPress={() => { setSelectedRequest(r); setScreen('request'); }}><BloodCard request={r} hospital={hospital} /></TouchableOpacity>)}</Section></ScrollView>; }
function Profile({ role, data, onRole, onLogout }) { return <ScrollView contentContainerStyle={styles.scroll}><Header title="Profile" subtitle="Your Nexcure workspace" /><View style={styles.profileHero}><Avatar large /><Text style={styles.profileName}>{data.user.name}</Text><Text style={styles.muted}>{roles[role]}  Â·  {data.user.area}</Text><Badge>{data.user.bloodGroup || 'Care member'}</Badge></View><Section title="Switch demo role">{Object.keys(roles).map((r) => <TouchableOpacity key={r} onPress={() => onRole(r)} style={styles.settingRow}><Icon name={r === role ? 'radio-button-on' : 'radio-button-off'} size={21} color={r === role ? colors.teal : colors.muted} /><Text style={styles.settingText}>{roles[r]} mode</Text></TouchableOpacity>)}</Section><Section title="Privacy and safety"><Card><Text style={styles.muted}>Secure demo session. No real medical records, CNIC values, phone numbers or credentials are used.</Text></Card></Section><Button title="Log out" icon="log-out-outline" variant="secondary" onPress={onLogout} /></ScrollView>; }
function DoctorCard({ doctor }) { return <Card><View style={styles.rowBetween}><View style={styles.row}><Avatar letter={doctor.name.slice(4, 5)} /><View><Text style={styles.cardTitle}>{doctor.name}</Text><Text style={styles.muted}>{doctor.specialty}  Â·  {doctor.hospital}</Text></View></View><Text style={styles.rating}>â˜… {doctor.rating}</Text></View><View style={styles.cardMeta}><Text style={styles.muted}>{doctor.distance}</Text><Badge tone={doctor.available ? 'green' : 'red'}>{doctor.available ? 'AVAILABLE TODAY' : 'NEXT SLOT SOON'}</Badge></View></Card>; }
function HospitalCard({ hospital }) { return <Card><View style={styles.rowBetween}><View style={styles.row}><View style={styles.smallLogo}><Icon name="business" size={19} color={colors.teal} /></View><View><Text style={styles.cardTitle}>{hospital.name}  âœ“</Text><Text style={styles.muted}>{hospital.area}</Text></View></View><Icon name="chevron-forward" size={19} color={colors.muted} /></View></Card>; }
function BloodCard({ request, hospital, hospitalMode, onFulfill }) { return <Card><View style={styles.rowBetween}><Badge tone="red">{request.status === 'ACTIVE' ? request.urgency : request.status}</Badge><Text style={styles.time}>{request.responses} response(s)</Text></View><Text style={styles.cardTitle}>{request.bloodGroup} blood needed</Text><Text style={styles.muted}>{request.units} units  Â·  {hospital?.name || 'Hospital'}  Â·  {request.location}</Text>{hospitalMode && request.status === 'ACTIVE' && <Button title="Mark fulfilled" icon="checkmark-circle" variant="secondary" onPress={onFulfill} />}</Card>; }
function AppointmentCard({ appointment }) { return <Card><View style={styles.rowBetween}><View><Text style={styles.cardTitle}>{appointment.doctor}</Text><Text style={styles.muted}>{appointment.hospital}</Text></View><Badge>{appointment.status}</Badge></View><View style={styles.appointmentTime}><Icon name="calendar-outline" size={18} color={colors.teal} /><Text style={styles.cardTitle}>{appointment.date}  Â·  {appointment.time}</Text></View></Card>; }
function Info({ label, value }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function EmptyState({ title, copy }) { return <Card style={styles.empty}><Icon name="file-tray-outline" size={28} color={colors.muted} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.muted}>{copy}</Text></Card>; }

function SectionTitle({ title, action, onAction, children }) { return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && <TouchableOpacity onPress={onAction}><Text style={styles.link}>{action}</Text></TouchableOpacity>}</View>{children}</View>; }

const styles = StyleSheet.create({ app: { flex: 1, backgroundColor: colors.bg }, scroll: { padding: 20, paddingBottom: 110 }, login: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.bg }, brandMark: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, brand: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: 0.2 }, loginTitle: { fontSize: 27, lineHeight: 32, fontWeight: '800', color: colors.ink, marginTop: 28, maxWidth: 280 }, loginCopy: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 25 }, loginCard: { padding: 18 }, fieldLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', color: colors.teal, letterSpacing: 1 }, inputHint: { color: colors.muted, marginTop: 6, marginBottom: 12 }, tabRow: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, marginBottom: 14 }, tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.line }, tabActive: { borderBottomColor: colors.teal }, tabText: { fontWeight: '700', color: colors.muted, fontSize: 13 }, tabTextActive: { color: colors.teal }, lockedCard: { opacity: 0.5 }, authTab: { flex: 1, paddingVertical: 10, alignItems: 'center' }, authTabActive: { backgroundColor: colors.teal, borderRadius: 10, margin: 4 }, authTabText: { fontWeight: '700', color: colors.muted }, authTabTextActive: { color: colors.white }, input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, color: colors.ink }, roleGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }, pill: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.mint, marginRight: 8, marginBottom: 8 }, pillActive: { backgroundColor: colors.teal }, pillText: { color: colors.teal, fontWeight: '700', fontSize: 12 }, pillTextActive: { color: colors.white }, primaryAuthButton: { backgroundColor: colors.teal, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 }, primaryAuthText: { color: colors.white, fontWeight: '800', fontSize: 15 }, roleButton: { height: 54, borderWidth: 1, borderColor: colors.line, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 9, backgroundColor: colors.white }, roleIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, roleText: { flex: 1, color: colors.ink, fontWeight: '700' }, loginFoot: { textAlign: 'center', color: colors.muted, marginTop: 12, fontSize: 12 }, separatorText: { textAlign: 'center', color: colors.muted, marginTop: 16, marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }, quickDemoList: { marginTop: 4 }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }, back: { marginRight: 12, padding: 4 }, eyebrow: { color: colors.teal, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 3 }, screenTitle: { fontSize: 26, fontWeight: '800', color: colors.ink }, subtitle: { color: colors.muted, marginTop: 4, fontSize: 13 }, homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, greeting: { color: colors.muted, fontSize: 15 }, name: { color: colors.ink, fontSize: 28, fontWeight: '800', marginTop: 2 }, iconButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red, position: 'absolute', right: 9, top: 8 }, searchBox: { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, marginBottom: 19 }, searchInput: { flex: 1, marginLeft: 9, color: colors.ink, fontSize: 15 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 7 }, quick: { width: '31.5%', backgroundColor: colors.white, borderRadius: 14, padding: 12, marginBottom: 10, minHeight: 91, borderWidth: 1, borderColor: colors.line }, quickIcon: { width: 33, height: 33, borderRadius: 10, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }, quickText: { color: colors.ink, fontSize: 12, lineHeight: 16, fontWeight: '700' }, section: { marginTop: 19 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink }, link: { color: colors.teal, fontWeight: '800', fontSize: 13 }, card: { backgroundColor: colors.white, borderRadius: 15, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.line }, cardTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 5 }, muted: { fontSize: 13, color: colors.muted, lineHeight: 19 }, button: { backgroundColor: colors.teal, height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 15, gap: 8 }, buttonText: { color: colors.white, fontWeight: '800', fontSize: 14 }, secondaryButton: { backgroundColor: colors.mint, borderWidth: 1, borderColor: '#B8DDD8' }, secondaryButtonText: { color: colors.teal }, dangerButton: { backgroundColor: '#FCE9E7' }, row: { flexDirection: 'row', alignItems: 'center' }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, avatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#CDE5E1', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, avatarText: { color: colors.teal, fontWeight: '800', fontSize: 17 }, largeAvatar: { width: 78, height: 78, borderRadius: 26, marginRight: 0, marginBottom: 12 }, largeAvatarText: { fontSize: 28 }, badge: { alignSelf: 'flex-start', backgroundColor: colors.mint, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5, marginTop: 3 }, badgeText: { color: colors.teal, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 }, redBadge: { backgroundColor: '#FCE9E7' }, greenBadge: { backgroundColor: '#E0F2E8' }, cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }, rating: { color: colors.amber, fontWeight: '800', fontSize: 13 }, impactBanner: { backgroundColor: colors.navy, borderRadius: 17, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }, bannerEyebrow: { color: '#A5D8D0', fontWeight: '800', fontSize: 10, letterSpacing: 1.2 }, bannerTitle: { color: colors.white, fontSize: 18, lineHeight: 23, fontWeight: '800', maxWidth: 245, marginTop: 7 }, statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, stat: { width: '31.5%', padding: 12 }, statValue: { color: colors.teal, fontSize: 21, fontWeight: '800' }, statLabel: { color: colors.muted, fontSize: 11, marginTop: 5, lineHeight: 15 }, chips: { flexDirection: 'row', marginBottom: 13, gap: 8 }, chip: { borderColor: colors.line, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: colors.white }, activeChip: { backgroundColor: colors.teal, borderColor: colors.teal }, chipText: { color: colors.muted, fontWeight: '700', fontSize: 12 }, activeChipText: { color: colors.white }, searchNote: { color: colors.muted, fontSize: 12, marginBottom: 3, fontStyle: 'italic' }, profileHero: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 17, padding: 22, borderWidth: 1, borderColor: colors.line, marginBottom: 13 }, profileName: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: 7 }, inline: { flexDirection: 'row', alignItems: 'center' }, slotRow: { flexDirection: 'row', gap: 8 }, slot: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 11, flex: 1 }, slotText: { color: colors.teal, fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 15 }, disclaimer: { fontSize: 11, color: colors.muted, lineHeight: 16, textAlign: 'center', marginTop: 17 }, appointmentTime: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.line }, empty: { alignItems: 'center', paddingVertical: 28 }, emptyTitle: { color: colors.ink, fontWeight: '800', fontSize: 15, marginTop: 9, marginBottom: 3 }, messageRow: { flexDirection: 'row', alignItems: 'center' }, messageBody: { flex: 1 }, messageTop: { flexDirection: 'row', justifyContent: 'space-between' }, time: { color: colors.muted, fontSize: 11 }, messageAction: { color: colors.teal, fontSize: 12, fontWeight: '800', marginTop: 6 }, unread: { width: 8, height: 8, backgroundColor: colors.teal, borderRadius: 4, marginLeft: 8 }, reportShare: { flexDirection: 'row', gap: 10, alignItems: 'center' }, uploadCard: { alignItems: 'center', padding: 22 }, urdu: { color: colors.ink, fontSize: 17, textAlign: 'right', marginTop: 15, lineHeight: 28 }, finding: { color: colors.muted, marginTop: 10, lineHeight: 20 }, filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 }, requestHero: { paddingVertical: 13, marginBottom: 5 }, requestTitle: { fontSize: 26, color: colors.ink, fontWeight: '800', marginTop: 12, marginBottom: 6 }, requestGrid: { flexDirection: 'row', flexWrap: 'wrap' }, info: { width: '50%', marginBottom: 17 }, infoLabel: { color: colors.muted, fontSize: 11, marginBottom: 5 }, infoValue: { color: colors.ink, fontWeight: '800', fontSize: 14 }, notification: { backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.line, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 9 }, unreadNotification: { borderColor: '#A8D8D2', backgroundColor: '#FBFEFD' }, notificationIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, bloodIcon: { backgroundColor: '#FCE9E7' }, notificationBody: { flex: 1 }, markRead: { alignSelf: 'flex-end', marginBottom: 12 }, hospitalHero: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 20, alignItems: 'center' }, logo: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, hospitalDescription: { textAlign: 'center', color: colors.muted, lineHeight: 20, marginTop: 10 }, smallLogo: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line, padding: 15 }, settingText: { color: colors.ink, fontWeight: '700', marginLeft: 10 }, toast: { position: 'absolute', bottom: 88, left: 18, right: 18, backgroundColor: colors.ink, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, toastText: { color: colors.white, fontWeight: '700', flex: 1 }, nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10 }, navItem: { alignItems: 'center', width: '20%', position: 'relative' }, navText: { color: colors.muted, fontSize: 10, marginTop: 4, fontWeight: '700' }, navActive: { color: colors.teal }, navDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red, position: 'absolute', top: -1, right: 20 }
});

