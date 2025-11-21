import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, Stethoscope, ShieldCheck, UserRound, LogOut, Plus, Trash2, Search, ChevronRight, Activity, Sparkles, Gauge, BarChart3, PieChart as PieIcon, LineChart as LineIcon, FileText, AlertTriangle, CheckCircle2, Brain } from 'lucide-react'
import Spline from '@splinetool/react-spline'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function App() {
  const [page, setPage] = useState('landing')
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const [doctors, setDoctors] = useState([
    { id: 'd1', name: 'Dr. Aisha Khan', email: 'aisha@med.ai', password: 'Pass@123', specialization: 'Cardiology', phone: '+1 555-0101', active: true },
  ])
  const [patients, setPatients] = useState([
    { id: 'p1', name: 'John Carter', email: 'john@health.ai', password: 'Pass@123', age: 34, gender: 'Male', phone: '+1 555-0202', address: '23 Elm St', bloodGroup: 'O+', active: true },
  ])
  const [records, setRecords] = useState([
    { patientId: 'p1', doctorId: 'd1', date: new Date().toISOString(), heartRate: 82, bpSystolic: 122, bpDiastolic: 78, temperature: 98.6, bloodSugar: 108, spo2: 98, respirationRate: 16, symptoms: 'Mild fatigue', diagnosis: 'Normal', ...riskFromVitals({ heartRate: 82, bpSystolic: 122, bpDiastolic: 78, temperature: 98.6, bloodSugar: 108, spo2: 98, respirationRate: 16 }) },
  ])

  const cursor = useAnimatedCursor()

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2200)
  }

  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', specialization: '', age: '', gender: 'Male', address: '', bloodGroup: 'O+' })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    setForm({ name: '', email: '', phone: '', password: '', confirm: '', specialization: '', age: '', gender: 'Male', address: '', bloodGroup: 'O+' })
    setFormErrors({})
  }, [role, authMode])

  const validate = () => {
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!/^\+?[0-9\-\s]{7,15}$/.test(form.phone || '')) errs.phone = 'Invalid phone'
    if (authMode === 'register' || role === 'Admin') {
      const strength = passwordStrength(form.password)
      if (strength.score < 2) errs.password = 'Password too weak'
      if (authMode === 'register' && form.password !== form.confirm) errs.confirm = "Passwords don't match"
    }
    if (authMode === 'register' && !form.name) errs.name = 'Name required'
    if (authMode === 'register' && role === 'Doctor' && !form.specialization) errs.specialization = 'Specialization required'
    if (authMode === 'register' && role === 'Patient' && !form.age) errs.age = 'Age required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return showToast('error', 'Please fix validation errors')
    setLoading(true)
    await delay(600)
    try {
      if (role === 'Admin') {
        if (form.email === 'admin@health.ai' && form.password === 'Admin@123') {
          setUser({ id: 'admin', name: 'Administrator', role: 'Admin' })
          setPage('admin')
          showToast('success', 'Welcome back, Admin')
        } else {
          showToast('error', 'Invalid admin credentials')
        }
      }
      if (role === 'Doctor') {
        const d = doctors.find(x => x.email === form.email && x.password === form.password)
        if (d) { setUser({ ...d, role: 'Doctor' }); setPage('doctor'); showToast('success', 'Logged in as Doctor') } else showToast('error', 'Invalid credentials')
      }
      if (role === 'Patient') {
        const p = patients.find(x => x.email === form.email && x.password === form.password)
        if (p) { setUser({ ...p, role: 'Patient' }); setPage('patient'); showToast('success', 'Logged in as Patient') } else showToast('error', 'Invalid credentials')
      }
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!validate()) return showToast('error', 'Please fix validation errors')
    setLoading(true)
    await delay(700)
    try {
      if (role === 'Doctor') {
        const id = `d${Date.now()}`
        const doc = { id, name: form.name, email: form.email, password: form.password, specialization: form.specialization, phone: form.phone, active: true }
        setDoctors(prev => [...prev, doc])
        setUser({ ...doc, role: 'Doctor' })
        setPage('doctor')
        showToast('success', 'Doctor account created')
      }
      if (role === 'Patient') {
        const id = `p${Date.now()}`
        const pat = { id, name: form.name, email: form.email, password: form.password, age: Number(form.age), gender: form.gender, phone: form.phone, address: form.address, bloodGroup: form.bloodGroup, active: true }
        setPatients(prev => [...prev, pat])
        setUser({ ...pat, role: 'Patient' })
        setPage('patient')
        showToast('success', 'Patient account created')
      }
    } finally { setLoading(false) }
  }

  const logout = () => {
    setUser(null)
    setRole(null)
    setPage('landing')
    showToast('success', 'Logged out')
  }

  const patientRecords = useMemo(() => records.filter(r => r.patientId === user?.id), [records, user])

  return (
    <div className="relative min-h-screen text-slate-100 bg-slate-950 overflow-hidden" onMouseMove={cursor.onMove} onClick={cursor.onClick}>
      <AnimatedBackground />
      <Header user={user} onLogout={logout} onNavigate={setPage} />
      <CursorFX cursor={cursor} />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className={`px-4 py-2 rounded-xl shadow-xl backdrop-blur bg-white/10 border ${toast.type === 'success' ? 'border-emerald-400/40 text-emerald-300' : 'border-rose-400/40 text-rose-300'}`}>
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                <span className="font-medium">{toast.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {page === 'landing' && (
            <motion.section key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[92vh]">
              <Hero onSelectRole={(r)=>{ setRole(r); setPage('auth'); setAuthMode('login') }} />
              <FeatureStrip />
            </motion.section>
          )}

          {page === 'auth' && (
            <motion.section key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="min-h-[92vh] flex items-center justify-center p-6">
              <AuthCard role={role} mode={authMode} setMode={setAuthMode} form={form} setForm={setForm} errors={formErrors} onSubmit={authMode==='login'?handleLogin:handleRegister} loading={loading} />
            </motion.section>
          )}

          {page === 'admin' && user && (
            <motion.section key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="px-6 py-8 max-w-7xl mx-auto">
              <DashboardHeader title="Admin Dashboard" subtitle="Manage users, records and system health" icon={ShieldCheck} />
              <AdminDashboard doctors={doctors} setDoctors={setDoctors} patients={patients} setPatients={setPatients} records={records} setRecords={setRecords} showToast={showToast} />
            </motion.section>
          )}

          {page === 'doctor' && user && (
            <motion.section key="doctor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="px-6 py-8 max-w-7xl mx-auto">
              <DashboardHeader title="Doctor Workspace" subtitle="Monitor patients, record vitals, and generate insights" icon={Stethoscope} />
              <DoctorDashboard user={user} patients={patients} records={records} setRecords={setRecords} showToast={showToast} />
            </motion.section>
          )}

          {page === 'patient' && user && (
            <motion.section key="patient" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="px-6 py-8 max-w-7xl mx-auto">
              <DashboardHeader title="Patient Portal" subtitle="Your health overview, reports and analytics" icon={UserRound} />
              <PatientDashboard user={user} records={patientRecords} allRecords={records} doctors={doctors} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}

function Hero({ onSelectRole }) {
  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full md:w-1/2 py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-xs mb-4">
            <HeartPulse className="w-4 h-4 animate-pulse" /> AI-Assisted Health Monitoring
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            <GradientText>Predict. Prevent. Personalize.</GradientText>
          </h1>
          <p className="mt-4 text-slate-300/90 max-w-xl">
            Real-time vitals, intelligent risk analysis, and beautiful analytics in a single, immersive experience.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Doctor', 'Patient', 'Admin'].map((r) => (
              <motion.button key={r} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onSelectRole(r)} className="relative overflow-hidden group rounded-2xl px-6 py-4 text-left bg-white/5 border border-white/10 hover:border-cyan-400/40">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300/80">Continue as</p>
                    <p className="text-xl font-bold">{r}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="w-full md:w-1/2 py-12 md:py-20">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Activity} label="Live Signals" value="6" suffix=" feeds" color="from-cyan-500 to-teal-400" />
            <StatCard icon={Gauge} label="Avg. Risk" value="24" suffix="%" color="from-emerald-500 to-cyan-400" />
            <StatCard icon={BarChart3} label="Records" value="1.2k" suffix="+" color="from-indigo-500 to-violet-500" />
            <StatCard icon={Sparkles} label="AI Insights" value="98" suffix="%" color="from-fuchsia-500 to-cyan-400" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureStrip() {
  const features = [
    { icon: LineIcon, title: 'Trend Analytics', desc: 'Animated ECG-style trends for vitals' },
    { icon: PieIcon, title: 'Risk Distribution', desc: 'See risk across cohorts at a glance' },
    { icon: FileText, title: 'Comprehensive Reports', desc: 'Generate shareable, beautiful PDFs' },
  ]
  return (
    <div className="relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-6">
        {features.map((f,i) => (
          <motion.div key={i} initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <f.icon className="w-6 h-6 text-cyan-300 mb-3" />
            <p className="font-semibold mb-1">{f.title}</p>
            <p className="text-sm text-slate-300/80">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AuthCard({ role, mode, setMode, form, setForm, errors, onSubmit, loading }) {
  const strength = passwordStrength(form.password)
  return (
    <div className="w-full max-w-3xl">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="flex items-center gap-2 text-cyan-300 mb-2"><Brain className="w-5 h-5" /><span className="text-xs uppercase tracking-widest">Smart Access</span></div>
            <h3 className="text-3xl font-bold mb-1">{mode==='login'?'Welcome back':'Create account'}</h3>
            <p className="text-slate-300/80 mb-6">Role: <span className="text-cyan-300 font-semibold">{role}</span></p>

            <div className="grid grid-cols-1 gap-4">
              {mode==='register' && (
                <FloatingInput label="Full name" value={form.name} onChange={v=>setForm(s=>({...s,name:v}))} error={errors.name} />
              )}
              <FloatingInput label="Email" type="email" value={form.email} onChange={v=>setForm(s=>({...s,email:v}))} error={errors.email} />
              <FloatingInput label="Phone" value={form.phone} onChange={v=>setForm(s=>({...s,phone:v}))} error={errors.phone} />
              {role==='Doctor' && mode==='register' && (
                <FloatingInput label="Specialization" value={form.specialization} onChange={v=>setForm(s=>({...s,specialization:v}))} error={errors.specialization} />
              )}
              {role==='Patient' && mode==='register' && (
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Age" type="number" value={form.age} onChange={v=>setForm(s=>({...s,age:v}))} error={errors.age} />
                  <Select label="Gender" value={form.gender} onChange={v=>setForm(s=>({...s,gender:v}))} options={["Male","Female","Other"]} />
                  <div className="col-span-2"><FloatingInput label="Address" value={form.address} onChange={v=>setForm(s=>({...s,address:v}))} /></div>
                  <Select label="Blood Group" value={form.bloodGroup} onChange={v=>setForm(s=>({...s,bloodGroup:v}))} options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} />
                </div>
              )}
              <FloatingInput label="Password" type="password" value={form.password} onChange={v=>setForm(s=>({...s,password:v}))} error={errors.password} />
              {mode==='register' && (
                <FloatingInput label="Confirm Password" type="password" value={form.confirm} onChange={v=>setForm(s=>({...s,confirm:v}))} error={errors.confirm} />
              )}

              <div className="mt-1">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${strength.percent}%` }} className={`h-full bg-gradient-to-r ${strength.color}`} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-slate-400">
                  <span>Strength: {strength.label}</span>
                  <span className="italic">{strength.tips}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={()=>setMode(mode==='login'?'register':'login')} className="text-cyan-300 hover:text-cyan-200 text-sm underline underline-offset-4">{mode==='login'?"Need an account? Register":"Have an account? Login"}</button>
                <FancyButton loading={loading} onClick={onSubmit}>{mode==='login'?"Sign in":"Create"}</FancyButton>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <ECGPanel />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AdminDashboard({ doctors, setDoctors, patients, setPatients, records, setRecords, showToast }) {
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState(null)

  const filteredDocs = useMemo(()=> doctors.filter(d=> d.name.toLowerCase().includes(query.toLowerCase()) || d.email.toLowerCase().includes(query.toLowerCase())),[doctors,query])
  const filteredPats = useMemo(()=> patients.filter(p=> p.name.toLowerCase().includes(query.toLowerCase()) || p.email.toLowerCase().includes(query.toLowerCase())),[patients,query])

  const removeItem = (type, id) => setConfirm({ type, id })
  const confirmRemove = () => {
    if (!confirm) return
    if (confirm.type==='doctor') setDoctors(prev=> prev.filter(x=>x.id!==confirm.id))
    if (confirm.type==='patient') { setPatients(prev=> prev.filter(x=>x.id!==confirm.id)); setRecords(prev=> prev.filter(r=> r.patientId!==confirm.id)) }
    setConfirm(null)
    showToast('success','Removed successfully')
  }

  const stats = [
    { label: 'Doctors', value: doctors.length, color: 'from-cyan-500 to-teal-400' },
    { label: 'Patients', value: patients.length, color: 'from-indigo-500 to-violet-500' },
    { label: 'Records', value: records.length, color: 'from-fuchsia-500 to-pink-500' },
  ]

  const riskDist = ['LOW','MEDIUM','HIGH'].map(level => ({ name: level, value: records.filter(r=>r.riskLevel===level).length || 1 }))
  const COLORS = ['#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s,i)=> <StatCard key={i} label={s.label} value={<AnimatedCounter end={s.value} />} color={s.color} icon={s.label==='Doctors'?Stethoscope:s.label==='Patients'?UserRound:FileText} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Directory</p>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search users..." className="pl-8 pr-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <DataTable title="Doctors" rows={filteredDocs} cols={[{k:'name'},{k:'email'},{k:'specialization'}]} onRemove={(id)=>removeItem('doctor',id)} />
            <DataTable title="Patients" rows={filteredPats} cols={[{k:'name'},{k:'email'},{k:'bloodGroup'}]} onRemove={(id)=>removeItem('patient',id)} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-2">Risk Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                {riskDist.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-slate-400">Risk levels across all records.</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="font-semibold mb-3">All Medical Records</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-300">
              <tr className="border-b border-white/10">
                <th className="text-left py-2">Patient</th>
                <th className="text-left">Doctor</th>
                <th className="text-left">Date</th>
                <th className="text-left">Vitals</th>
                <th className="text-left">Risk</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r,i)=> (
                <motion.tr key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-b border-white/5/10 hover:bg-white/5">
                  <td className="py-2">{patients.find(p=>p.id===r.patientId)?.name || r.patientId}</td>
                  <td>{doctors.find(d=>d.id===r.doctorId)?.name || r.doctorId}</td>
                  <td>{new Date(r.date).toLocaleString()}</td>
                  <td className="text-slate-300/80">HR {r.heartRate} • BP {r.bpSystolic}/{r.bpDiastolic} • SpO2 {r.spo2}%</td>
                  <td><RiskPill level={r.riskLevel} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {confirm && (
          <Modal onClose={()=>setConfirm(null)}>
            <div className="text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="font-semibold mb-1">Are you sure?</p>
              <p className="text-slate-300/80 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={()=>setConfirm(null)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">Cancel</button>
                <button onClick={confirmRemove} className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white">Yes, remove</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function DoctorDashboard({ user, patients, records, setRecords, showToast }) {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '')
  const [vitals, setVitals] = useState({ heartRate: '', bpSystolic: '', bpDiastolic: '', temperature: '', bloodSugar: '', spo2: '', respirationRate: '', symptoms: '', diagnosis: '' })

  const myPatients = useMemo(()=> patients, [patients])
  const patientHistory = useMemo(()=> records.filter(r=> r.patientId===selectedPatient).slice(-8), [records, selectedPatient])

  const addRecord = () => {
    const parsed = {
      heartRate: Number(vitals.heartRate), bpSystolic: Number(vitals.bpSystolic), bpDiastolic: Number(vitals.bpDiastolic), temperature: Number(vitals.temperature), bloodSugar: Number(vitals.bloodSugar), spo2: Number(vitals.spo2), respirationRate: Number(vitals.respirationRate)
    }
    if (Object.values(parsed).some(v=> isNaN(v))) return showToast('error','Please enter valid numeric vitals')
    const risk = riskFromVitals(parsed)
    const rec = { patientId: selectedPatient, doctorId: user.id, date: new Date().toISOString(), ...parsed, symptoms: vitals.symptoms, diagnosis: vitals.diagnosis, ...risk }
    setRecords(prev=> [...prev, rec])
    setVitals({ heartRate: '', bpSystolic: '', bpDiastolic: '', temperature: '', bloodSugar: '', spo2: '', respirationRate: '', symptoms: '', diagnosis: '' })
    showToast('success','Record saved')
  }

  const risk = riskFromVitals({
    heartRate: Number(vitals.heartRate || 70), bpSystolic: Number(vitals.bpSystolic || 120), bpDiastolic: Number(vitals.bpDiastolic || 80), temperature: Number(vitals.temperature || 98.6), bloodSugar: Number(vitals.bloodSugar || 100), spo2: Number(vitals.spo2 || 98), respirationRate: Number(vitals.respirationRate || 16)
  })

  const trendData = patientHistory.map((r, idx)=> ({ idx, HR: r.heartRate, SPO2: r.spo2, Temp: r.temperature }))

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400 mb-2">My Patients</p>
          <div className="space-y-2 max-h-60 overflow-auto pr-1">
            {myPatients.map(p=> (
              <button key={p.id} onClick={()=> setSelectedPatient(p.id)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedPatient===p.id? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 hover:bg-white/5'}`}>
                <div className="flex items-center justify-between"><span className="font-medium">{p.name}</span><span className="text-xs text-slate-400">{p.bloodGroup}</span></div>
                <div className="text-xs text-slate-400">{p.email}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-3">Enter Patient Vitals</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {k:'heartRate',label:'Heart Rate',suffix:'bpm'},{k:'bpSystolic',label:'BP Systolic',suffix:'mmHg'},{k:'bpDiastolic',label:'BP Diastolic',suffix:'mmHg'},{k:'temperature',label:'Temperature',suffix:'°F'},{k:'bloodSugar',label:'Blood Sugar',suffix:'mg/dL'},{k:'spo2',label:'SpO2',suffix:'%'},{k:'respirationRate',label:'Respiration',suffix:'rpm'}
            ].map((f)=> (
              <div key={f.k} className="group">
                <label className="text-xs text-slate-400">{f.label}</label>
                <div className="relative">
                  <input value={vitals[f.k]} onChange={e=> setVitals(s=> ({...s,[f.k]: e.target.value }))} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono" placeholder={f.suffix} />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">{f.suffix}</span>
                </div>
              </div>
            ))}
            <div className="sm:col-span-3 grid sm:grid-cols-2 gap-3">
              <textarea value={vitals.symptoms} onChange={e=> setVitals(s=> ({...s, symptoms: e.target.value }))} placeholder="Symptoms" className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40" />
              <textarea value={vitals.diagnosis} onChange={e=> setVitals(s=> ({...s, diagnosis: e.target.value }))} placeholder="Diagnosis" className="px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <RiskGauge score={risk.riskScore} level={risk.riskLevel} />
            <div className="flex gap-2">
              <FancyButton onClick={addRecord}><Plus className="w-4 h-4 mr-2" />Save Record</FancyButton>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-2">Patient History</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <XAxis dataKey="idx" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="HR" stroke="#06B6D4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="SPO2" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Temp" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-2">My Patients</p>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {myPatients.map(p=> (
              <motion.div key={p.id} whileHover={{ scale: 1.01 }} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.age} • {p.gender} • {p.bloodGroup}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PatientDashboard({ user, records, allRecords, doctors }) {
  const [flip, setFlip] = useState(false)
  const latest = records.slice(-1)[0]
  const riskCounts = {
    LOW: allRecords.filter(r=> r.patientId===user.id && r.riskLevel==='LOW').length,
    MEDIUM: allRecords.filter(r=> r.patientId===user.id && r.riskLevel==='MEDIUM').length,
    HIGH: allRecords.filter(r=> r.patientId===user.id && r.riskLevel==='HIGH').length,
  }
  const pieData = [
    { name: 'LOW', value: riskCounts.LOW, color: '#10B981' },
    { name: 'MEDIUM', value: riskCounts.MEDIUM, color: '#F59E0B' },
    { name: 'HIGH', value: riskCounts.HIGH, color: '#EF4444' },
  ]

  const trend = records.map((r,i)=> ({ i, HR: r.heartRate, Sugar: r.bloodSugar, SPO2: r.spo2 }))

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div onClick={()=>setFlip(v=>!v)} className="cursor-pointer [perspective:1000px]">
          <motion.div animate={{ rotateY: flip?180:0 }} transition={{ type:'spring', stiffness: 120, damping: 14 }} className="relative h-full min-h-[160px] rounded-2xl border border-white/10 bg-white/5 p-4 [transform-style:preserve-3d]">
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <p className="text-sm text-slate-400">My Profile</p>
              <p className="text-xl font-bold mt-2">{user.name}</p>
              <p className="text-slate-300/80 text-sm">{user.email}</p>
              <div className="mt-4 text-xs text-slate-400">Tap to flip</div>
            </div>
            <div className="absolute inset-0 rotate-y-180 [backface-visibility:hidden] flex flex-col">
              <p className="text-sm text-slate-400">Details</p>
              <p className="text-sm">Age: {user.age} • {user.gender}</p>
              <p className="text-sm">Phone: {user.phone}</p>
              <p className="text-sm">Blood: {user.bloodGroup}</p>
            </div>
          </motion.div>
        </motion.div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Latest Risk</p>
          <RiskGauge score={latest?.riskScore || 0} level={latest?.riskLevel || 'LOW'} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400 mb-2">Risk Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {pieData.map((d,i)=> <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-2">Health Reports</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left">Doctor</th>
                  <th className="text-left">Vitals</th>
                  <th className="text-left">Risk</th>
                </tr>
              </thead>
              <tbody>
                {records.slice().reverse().map((r,i)=> (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-b border-white/5/10 hover:bg-white/5">
                    <td className="py-2">{new Date(r.date).toLocaleString()}</td>
                    <td>{doctors.find(d=>d.id===r.doctorId)?.name || r.doctorId}</td>
                    <td className="text-slate-300/80">HR {r.heartRate} • BP {r.bpSystolic}/{r.bpDiastolic} • SpO2 {r.spo2}%</td>
                    <td><RiskPill level={r.riskLevel} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-semibold mb-2">Health Analytics</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <XAxis dataKey="i" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="HR" stroke="#06B6D4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Sugar" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="SPO2" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Header({ user, onLogout, onNavigate }) {
  return (
    <header className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_0_3px_rgba(99,102,241,0.25)]">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <p className="font-extrabold leading-none"><GradientText>VitalSight</GradientText></p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-200/80">AI Health Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button onClick={()=>onNavigate('landing')} className="px-3 py-2 text-sm text-slate-300 hover:text-white">Home</button>
              <FancyButton onClick={()=>onNavigate('auth')}>Get Started</FancyButton>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-1 text-xs text-slate-300/80 mr-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> {user.role}
              </div>
              <button onClick={onLogout} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-slate-400 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div>Designed with care • Cyan/Indigo theme • Tailwind + Motion</div>
        <div className="flex items-center gap-2">Made by <span className="text-slate-200 font-semibold">Flames</span> • <span className="text-cyan-300">AI</span> Powered</div>
      </div>
    </footer>
  )
}

function DashboardHeader({ title, subtitle, icon:Icon }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold"><GradientText>{title}</GradientText></h2>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}

function DataTable({ title, rows, cols, onRemove }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <div className="text-xs text-slate-400">{rows.length} items</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-300">
            <tr className="border-b border-white/10">
              {cols.map((c,i)=>(<th key={i} className="text-left py-2 capitalize">{c.k}</th>))}
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=> (
              <motion.tr key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }} className="border-b border-white/5/10">
                {cols.map((c,ci)=> (<td key={ci} className="py-2">{r[c.k]}</td>))}
                <td className="text-right pr-2">
                  <button onClick={()=>onRemove(r.id)} className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30"><Trash2 className="w-4 h-4" /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
        {children}
      </motion.div>
    </motion.div>
  )
}

function RiskPill({ level }) {
  const map = { LOW: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30', MEDIUM: 'text-amber-300 bg-amber-500/10 border-amber-400/30', HIGH: 'text-rose-300 bg-rose-500/10 border-rose-400/30' }
  return <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${map[level]}`}><span className={`w-1.5 h-1.5 rounded-full ${level==='LOW'?'bg-emerald-400 animate-pulse':level==='MEDIUM'?'bg-amber-400 animate-pulse':'bg-rose-500 animate-ping'}`} />{level}</span>
}

function RiskGauge({ score, level }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, score))
  const color = level==='LOW'? '#10B981' : level==='MEDIUM' ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow">
        <circle cx="70" cy="70" r={radius} stroke="#0b1220" strokeWidth="16" fill="none" />
        <circle cx="70" cy="70" r={radius} stroke={color} strokeLinecap="round" strokeWidth="16" fill="none" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference * (1 - pct/100)}`} transform="rotate(-90 70 70)" />
        <text x="70" y="74" textAnchor="middle" fill="#e2e8f0" fontSize="20" fontWeight="700">{Math.round(score)}</text>
      </svg>
      <div>
        <p className="text-sm text-slate-400">AI Risk Assessment</p>
        <p className="text-lg font-extrabold"><span className="mr-2">{level}</span><span className="text-slate-400 text-sm">({Math.round(score)}%)</span></p>
        <p className="text-xs text-slate-400 mt-1">{level==='HIGH'?'Immediate attention recommended': level==='MEDIUM'?'Monitor closely and retest soon':'Keep up the good work'}</p>
      </div>
    </div>
  )
}

function StatCard({ icon:Icon, label, value, suffix, color='from-cyan-500 to-indigo-500' }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-extrabold">{typeof value==='string'?value:<>{value}</>}{suffix}</p>
        </div>
        {Icon && <Icon className="w-6 h-6 text-cyan-300" />}
      </div>
    </motion.div>
  )
}

function AnimatedCounter({ end=0, duration=1.2 }) {
  const [val, setVal] = useState(0)
  useEffect(()=>{
    let start = 0
    const st = performance.now()
    const step = (t)=>{
      const p = Math.min(1, (t-st)/(duration*1000))
      const ease = 1 - Math.pow(1-p, 3)
      setVal(Math.round(start + (end-start)*ease))
      if (p<1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  },[end,duration])
  return <>{val}</>
}

function FancyButton({ children, onClick, loading }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} disabled={loading} className="relative inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/10 disabled:opacity-60 overflow-hidden">
      <span className="relative z-10 flex items-center">{children}</span>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-10" />
      {loading && <span className="ml-2 h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
    </motion.button>
  )
}

function FloatingInput({ label, value, onChange, type='text', error }) {
  const id = useRef(`f-${Math.random().toString(36).slice(2)}`).current
  return (
    <div className="relative">
      <input id={id} type={type} value={value} onChange={(e)=>onChange(e.target.value)} className={`w-full px-3 py-3 rounded-xl bg-slate-900/60 border outline-none focus:ring-2 focus:ring-cyan-500/40 peer ${error?'border-rose-500/50':'border-white/10'}`} placeholder=" " />
      <label htmlFor={id} className="absolute left-3 top-1/2 -translate-y-1/2 px-1 text-slate-400 bg-slate-900/60 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-cyan-200 transition-all">{label}</label>
      {error && <div className="mt-1 text-xs text-rose-300 animate-[shake_0.3s]">{error}</div>}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/40">
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function ECGPanel() {
  return (
    <div className="relative h-full min-h-[340px] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <p className="text-slate-300/80 text-sm mb-2">ECG Signal</p>
        <div className="h-28 overflow-hidden">
          <div className="ecg-line h-full w-[200%]" />
        </div>
        <div className="mt-4 text-xs text-slate-400">Secure • Encrypted • HIPAA-ready</div>
      </div>
    </div>
  )
}

function GradientText({ children }) {
  return <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent drop-shadow">{children}</span>
}

function AnimatedBackground() {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: 'radial-gradient(1000px 400px at 20% -10%, rgba(20,184,166,0.25), transparent), radial-gradient(800px 300px at 90% 10%, rgba(99,102,241,0.25), transparent)' }} />
      <motion.div className="absolute -z-10 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 8 }} style={{ top: '20%', left: '10%' }} />
      <motion.div className="absolute -z-10 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl" animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10 }} style={{ bottom: '10%', right: '10%' }} />
    </>
  )
}

function useAnimatedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [clicks, setClicks] = useState([])
  const [trail, setTrail] = useState([])
  const moveTimeout = useRef(null)

  const onMove = (e) => {
    setPos({ x: e.clientX, y: e.clientY })
    setTrail((t)=> [...t.slice(-12), { x: e.clientX, y: e.clientY, id: Math.random() }])
    if (moveTimeout.current) clearTimeout(moveTimeout.current)
    moveTimeout.current = setTimeout(()=> setTrail([]), 120)
  }
  const onClick = (e) => {
    setClicks((c)=> [...c, { x: e.clientX, y: e.clientY, id: Math.random() }])
    setTimeout(()=> setClicks((c)=> c.slice(1)), 500)
  }
  return { pos, clicks, trail, onMove, onClick }
}

function CursorFX({ cursor }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <motion.div className="w-5 h-5 rounded-full border border-cyan-300/60 shadow-[0_0_20px_rgba(34,211,238,0.4)] absolute" animate={{ x: cursor.pos.x - 10, y: cursor.pos.y - 10 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} />
      <motion.div className="w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-xl absolute" animate={{ x: cursor.pos.x, y: cursor.pos.y }} />
      {cursor.trail.map(t=> (
        <motion.span key={t.id} className="absolute w-2 h-2 rounded-full bg-cyan-300/60" initial={{ opacity: 0.8 }} animate={{ x: t.x, y: t.y, opacity: 0 }} transition={{ duration: 0.4 }} />
      ))}
      {cursor.clicks.map(c=> (
        <motion.span key={c.id} className="absolute rounded-full border border-cyan-300/50" initial={{ x: c.x-10, y: c.y-10, width: 20, height: 20, opacity: 0.8 }} animate={{ x: c.x-30, y: c.y-30, width: 60, height: 60, opacity: 0 }} transition={{ duration: 0.5 }} />
      ))}
    </div>
  )
}

function passwordStrength(pw='') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const percent = Math.min(100, (score/5)*100)
  const label = percent>80?'Strong': percent>50?'Good': percent>30?'Fair':'Weak'
  const color = percent>80?'from-emerald-400 to-cyan-400': percent>50?'from-cyan-400 to-indigo-400': percent>30?'from-amber-400 to-yellow-400':'from-rose-400 to-orange-400'
  const tips = percent>80?'Great password': percent>50?'Add symbols for extra strength': percent>30?'Use upper/lowercase & numbers':'8+ chars recommended'
  return { score, percent, label, color, tips }
}

function riskFromVitals({ heartRate, bpSystolic, bpDiastolic, temperature, bloodSugar, spo2, respirationRate }) {
  let risk = 0
  risk += Math.max(0, Math.abs(heartRate - 75) / 1.5)
  risk += Math.max(0, Math.abs(bpSystolic - 120) / 2)
  risk += Math.max(0, Math.abs(bpDiastolic - 80) / 2)
  risk += Math.max(0, Math.abs(temperature - 98.6) * 6)
  risk += Math.max(0, Math.abs(bloodSugar - 100) / 1.8)
  risk += Math.max(0, (98 - spo2) * 6)
  risk += Math.max(0, Math.abs(respirationRate - 16) * 2)
  risk = Math.max(0, Math.min(100, risk))
  const level = risk < 30 ? 'LOW' : risk <= 60 ? 'MEDIUM' : 'HIGH'
  return { riskScore: risk, riskLevel: level }
}

function delay(ms){ return new Promise(r=>setTimeout(r,ms)) }

// minimal extra styles for ECG and shake
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `@keyframes shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(2px)}30%,50%,70%{transform:translateX(-4px)}40%,60%{transform:translateX(4px)}}\n@keyframes ecgMove{from{background-position:0 0}to{background-position:-400px 0}}\n.ecg-line{background:repeating-linear-gradient(90deg,rgba(34,211,238,0.85),rgba(34,211,238,0.85) 2px,transparent 2px,transparent 6px),radial-gradient(circle at 30px 50%,rgba(34,211,238,0.9) 2px,transparent 3px);background-size:200px 2px,120px 60px;background-repeat:repeat-x;animation:ecgMove 2.2s linear infinite;border-top:2px solid rgba(34,211,238,0.8)}`
  document.head.appendChild(style)
}

export default App
