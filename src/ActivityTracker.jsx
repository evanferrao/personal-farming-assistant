// ActivityTracker.jsx

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Filter, Calendar, Tag, Droplets, Bug, Sprout, X } from 'lucide-react';
import './FarmerInfoForm.css'; // Import styles for the modal structure

const DEFAULT_TYPES = [
  { key: 'sowing', label: 'Sowing', icon: Sprout },
  { key: 'irrigation', label: 'Irrigation', icon: Droplets },
  { key: 'input', label: 'Input use', icon: Tag },
  { key: 'pest', label: 'Pest issue', icon: Bug },
  { key: 'other', label: 'Other', icon: Tag },
];

const STORAGE_KEY = 'pfa_activity_log_v1';

export default function ActivityTracker({ isOpen, onClose, lang = 'en', farmId = 'local' }) {
  const [type, setType] = useState('sowing');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [field, setField] = useState(''); // optional plot/field name

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setActivities(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch {}
  }, [activities]);

  const addActivity = () => {
    if (!note.trim() && !qty) return;
    const entry = {
      id: crypto.randomUUID(),
      farmId,
      type,
      note: note.trim(),
      qty: qty ? Number(qty) : null,
      unit: unit || null,
      date,
      field: field || null,
      createdAt: new Date().toISOString(),
    };
    setActivities([entry, ...activities]);
    setNote('');
    setQty('');
    setUnit('');
    // keep date same for quick multiple logs
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  const T = {
    title: lang === 'ml' ? 'പ്രവർത്തന ലോഗ്' : 'Activity Log',
    sub: lang === 'ml' ? 'നിങ്ങളുടെ ഫാമിന്റെ പ്രവർത്തനങ്ങൾ രേഖപ്പെടുത്തുക.' : 'Log your farm activities.',
    date: lang === 'ml' ? 'തിയതി' : 'Date',
    field: lang === 'ml' ? 'പ്ലോട്ട്/ഫീൽഡ്' : 'Plot/Field',
    qty: lang === 'ml' ? 'പരിമാണം' : 'Quantity',
    unit: lang === 'ml' ? 'യൂണിറ്റ്' : 'Unit',
    notePh: lang === 'ml' ? 'സരള ഭാഷയിൽ എഴുതുക…' : 'Write in simple language…',
    add: lang === 'ml' ? 'ചേർക്കുക' : 'Add Activity',
    filter: lang === 'ml' ? 'ഫിൽറ്റർ' : 'Filter',
    all: lang === 'ml' ? 'എല്ലാം' : 'All',
    empty: lang === 'ml' ? 'എന്നും ലോഗുകളില്ല' : 'No activities yet',
  };
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="farmer-form-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="farmer-form-modal"
        style={{ width: 'min(720px, 100%)' }} // smaller modal
      >
        <div className="farmer-form-header">
            <div className="farmer-form-header__content">
                <h2>{T.title}</h2>
                <p>{T.sub}</p>
            </div>
            <button onClick={onClose} className="farmer-form-close" type="button">
                <X size={24} />
            </button>
        </div>
        
        <div className="farmer-form-body">
            <div className="form-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
                {/* Quick type chips */}
                <div className="form-progress__chips" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                {DEFAULT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = type === t.key;
                    return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setType(t.key)}
                        className={`form-progress__chip ${active ? 'is-active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        aria-pressed={active}
                    >
                        <Icon size={16} />
                        <span>{t.label}</span>
                    </button>
                    );
                })}
                </div>

                {/* Inputs */}
                <div className="form-grid form-grid--three" style={{ paddingTop: '1rem' }}>
                <div className="form-field">
                    <label className="form-label"><Calendar size={12} /> {T.date}</label>
                    <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="form-field">
                    <label className="form-label">{T.field}</label>
                    <input className="form-input" placeholder="e.g., North plot" value={field} onChange={e => setField(e.target.value)} />
                </div>

                <div className="form-grid form-grid--three form-grid__full" style={{ gap: '0.75rem' }}>
                    <div className="form-field">
                    <label className="form-label">{T.qty}</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g., 2" />
                    </div>
                    <div className="form-field">
                    <label className="form-label">{T.unit}</label>
                    <input className="form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="hours, L, kg…" />
                    </div>
                    <div className="form-field form-grid__full">
                    <label className="form-label">{T.notePh}</label>
                    <textarea className="form-input form-input--textarea" value={note} onChange={e => setNote(e.target.value)} placeholder={T.notePh} />
                    </div>
                </div>
                </div>

                <div className="farmer-form-footer" style={{ justifyContent: 'flex-end', paddingTop: '0.75rem', paddingBottom: 0 }}>
                    <button className="form-btn form-btn--primary" onClick={addActivity}>
                        <Plus size={16} /> {T.add}
                    </button>
                </div>
            </div>

            <div className="form-card" style={{ boxShadow: 'none', border: '1px solid var(--form-border)', padding: '0.75rem' }}>
                {/* Filter + list */}
                <div className="form-declaration" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', padding: '0 0 0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Filter size={14} />
                        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option value="all">{T.all}</option>
                        {DEFAULT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </select>
                    </div>
                </div>
                <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                    <p style={{ color: 'var(--form-muted)', padding: '0.75rem 0' }}>{T.empty}</p>
                ) : (
                    filtered.map(a => (
                    <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="form-declaration"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontWeight: 700 }}>
                            {DEFAULT_TYPES.find(t => t.key === a.type)?.label || 'Activity'} • {a.date}
                            {a.field ? ` • ${a.field}` : ''}
                            {a.qty ? ` • ${a.qty}${a.unit ? ' ' + a.unit : ''}` : ''}
                        </div>
                        {a.note ? <div style={{ color: 'var(--form-text)' }}>{a.note}</div> : null}
                        </div>
                        <button className="form-btn form-btn--ghost" onClick={() => removeActivity(a.id)} aria-label="Delete">
                        <Trash2 size={16} />
                        </button>
                    </motion.div>
                    ))
                )}
                </AnimatePresence>
            </div>
        </div>

      </motion.div>
    </motion.div>
  );
}