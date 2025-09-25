import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './FarmerInfoForm.css';

const SectionTitle = ({ children }) => (
  <div className="form-section-title">
    <span className="form-section-title__accent" />
    <h3>{children}</h3>
    <div className="form-section-title__underline" />
  </div>
);

const FormCard = ({ children }) => (
  <div className="form-card">
    {children}
  </div>
);

const FarmerInfoForm = ({ isOpen, onClose, language }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // ... (keep all form state)
    fullName: '',
    fatherSpouseName: '',
    gender: '',
    dob: '',
    contactNumber: '',
    email: '',
    aadhaar: '',
    address: '',
    landholding: '',
    ownershipType: '',
    irrigationSource: '',
    soilType: '',
    farmLocation: '',
    primaryCrops: '',
    seasonalCrops: '',
    averageYield: '',
    farmingType: '',
    livestock: '',
    bankAccount: '',
    paymentMode: '',
    govtSchemes: '',
    marketChannels: '',
    smartphoneAccess: '',
    modernEquipment: '',
    trainingNeeds: '',
    signature: '',
    date: '',
    place: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => (prev < 6 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Thank you for your submission!');
    onClose();
  };

  if (!isOpen) return null;

  const TEXTS = {
    en: {
      title: "Farmer Information Form",
      subtitle: "Complete your profile for personalized advice.",
      steps: ["Personal Information", "Farm Details", "Agricultural Information", "Financial & Market Details", "Technology & Support", "Declaration"],
      buttons: {
        next: "Next",
        previous: "Previous",
        submit: "Submit Form"
      },
      labels: {
        fullName: "Full Name",
        fatherSpouseName: "Father's / Spouse's Name",
        gender: "Gender",
        dob: "Date of Birth / Age",
        contactNumber: "Contact Number",
        email: "Email (if available)",
        aadhaar: "Aadhaar / ID Proof Number",
        address: "Address (Village, Post Office, District, State, PIN Code)",
        landholding: "Total Landholding (in acres/hectares)",
        ownershipType: "Ownership Type (Owned / Leased / Sharecropped)",
        irrigationSource: "Irrigation Source (Canal, Borewell, Rainfed, Drip, etc.)",
        soilType: "Soil Type (Black, Red, Sandy, Loamy, etc.)",
        farmLocation: "Farm Location (GPS / Survey Number if required)",
        primaryCrops: "Primary Crops Grown (paddy, wheat, maize, etc.)",
        seasonalCrops: "Seasonal Crops (Kharif / Rabi / Zaid)",
        averageYield: "Average Yield per Season",
        farmingType: "Type of Farming (Conventional / Organic / Mixed)",
        livestock: "Livestock Details (if any – cows, buffalo, goats, poultry, etc.)",
        bankAccount: "Bank Account Details (Account No., IFSC, Bank Name)",
        paymentMode: "Preferred Mode of Payment (Bank Transfer / Cash)",
        govtSchemes: "Access to Government Schemes (Yes/No; if yes, which ones)",
        marketChannels: "Current Market Channels (Mandis, Middlemen, Direct Sale, Online Platforms)",
        smartphoneAccess: "Access to Smartphone / Internet (Yes/No)",
        modernEquipment: "Use of Modern Equipment (Tractor, Harvester, Drone, etc.)",
        trainingNeeds: "Need for Training / Support (Yes/No; specify in Irrigation, Fertilizer, Pesticide, Marketing, Digital Apps, etc.)",
        signature: "Signature / Thumb Impression of Farmer",
        date: "Date",
        place: "Place",
        declaration: "I hereby declare that the information provided is true to the best of my knowledge."
      }
    },
  ml: {
    title: "കർഷക വിവര ഫോം",
    subtitle: "വ്യക്തിഗത ഉപദേശത്തിനായി നിങ്ങളുടെ പ്രൊഫൈൽ പൂർത്തിയാക്കുക.",
        steps: ["വ്യക്തിഗത വിവരങ്ങൾ", "ഫാം വിശദാംശങ്ങൾ", "കാർഷിക വിവരങ്ങൾ", "സാമ്പത്തികവും വിപണി വിശദാംശങ്ങളും", "സാങ്കേതികവിദ്യയും പിന്തുണയും", "പ്രഖ്യാപനം"],
        buttons: {
            next: "അടുത്തത്",
            previous: "മുമ്പത്തേത്",
            submit: "ഫോം സമർപ്പിക്കുക"
        },
        labels: {
            fullName: "മുഴുവൻ പേര്",
            fatherSpouseName: "അച്ഛന്റെ / പങ്കാളിയുടെ പേര്",
            gender: "ലിംഗം",
            dob: "ജനന തീയതി / പ്രായം",
            contactNumber: "ബന്ധപ്പെടാനുള്ള നമ്പർ",
            email: "ഇമെയിൽ (ലഭ്യമെങ്കിൽ)",
            aadhaar: "ആധാർ / ഐഡി പ്രൂഫ് നമ്പർ",
            address: "വിലാസം (ഗ്രാമം, പോസ്റ്റ് ഓഫീസ്, ജില്ല, സംസ്ഥാനം, പിൻ കോഡ്)",
            landholding: "ആകെ ഭൂമി (ഏക്കറിൽ/ഹെക്ടറിൽ)",
            ownershipType: "ഉടമസ്ഥാവകാശ തരം (സ്വന്തം / പാട്ടത്തിന് / പങ്കാളിത്തം)",
            irrigationSource: "ജലസേചന ഉറവിടം (കനാൽ, കിണർ, മഴ, ഡ്രിപ്പ് മുതലായവ)",
            soilType: "മണ്ണിന്റെ തരം (കറുപ്പ്, ചുവപ്പ്, മണൽ, എക്കൽ മുതലായവ)",
            farmLocation: "ഫാം സ്ഥാനം (ജിപിഎസ് / സർവേ നമ്പർ ആവശ്യമെങ്കിൽ)",
            primaryCrops: "പ്രധാനമായും കൃഷി ചെയ്യുന്ന വിളകൾ (നെല്ല്, ഗോതമ്പ്, ചോളം മുതലായവ)",
            seasonalCrops: "കാലാനുസൃതമായ വിളകൾ (ഖാരിഫ് / റാബി / സെയ്ദ്)",
            averageYield: "ഓരോ സീസണിലെയും ശരാശരി വിളവ്",
            farmingType: "കൃഷി രീതി (പരമ്പരാഗതം / ജൈവ / മിശ്രിതം)",
            livestock: "കന്നുകാലികളുടെ വിശദാംശങ്ങൾ (ഉണ്ടെങ്കിൽ - പശു, എരുമ, ആട്, കോഴി മുതലായവ)",
            bankAccount: "ബാങ്ക് അക്കൗണ്ട് വിശദാംശങ്ങൾ (അക്കൗണ്ട് നമ്പർ, IFSC, ബാങ്കിന്റെ പേര്)",
            paymentMode: "ഇഷ്ടപ്പെട്ട പണമടയ്ക്കൽ രീതി (ബാങ്ക് ട്രാൻസ്ഫർ / പണം)",
            govtSchemes: "സർക്കാർ പദ്ധതികളിലേക്കുള്ള പ്രവേശനം (ഉണ്ട്/ഇല്ല; ഉണ്ടെങ്കിൽ, ഏതെല്ലാം)",
            marketChannels: "നിലവിലെ വിപണന മാർഗ്ഗങ്ങൾ (മണ്ടികൾ, ഇടനിലക്കാർ, നേരിട്ടുള്ള വിൽപ്പന, ഓൺലൈൻ പ്ലാറ്റ്‌ഫോമുകൾ)",
            smartphoneAccess: "സ്മാർട്ട്ഫോൺ / ഇന്റർനെറ്റ് ലഭ്യത (ഉണ്ട്/ഇല്ല)",
            modernEquipment: "ആധുനിക ഉപകരണങ്ങളുടെ ഉപയോഗം (ട്രാക്ടർ, ഹാർവെസ്റ്റർ, ഡ്രോൺ മുതലായവ)",
            trainingNeeds: "പരിശീലനത്തിനോ പിന്തുണയ്‌ക്കോ ഉള്ള ആവശ്യം (ഉണ്ട്/ഇല്ല; ജലസേചനം, വളം, കീടനാശിനി, വിപണനം, ഡിജിറ്റൽ ആപ്പുകൾ എന്നിവയിൽ വ്യക്തമാക്കുക)",
            signature: "കർഷകന്റെ ഒപ്പ് / തള്ളവിരലടയാളം",
            date: "തീയതി",
            place: "സ്ഥലം",
            declaration: "നൽകിയിട്ടുള്ള വിവരങ്ങൾ എന്റെ അറിവിൽ ശരിയാണെന്ന് ഞാൻ ഇതിനാൽ പ്രഖ്യാപിക്കുന്നു."
        }
    }
  };
  
  const T = TEXTS[language];

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
      >
        <div className="farmer-form-header">
          <div className="farmer-form-header__content">
            <span className="farmer-form-header__badge">
              <span className="farmer-form-header__badge-line" />
              Farmer Profile
            </span>
            <h2>{T.title}</h2>
            <p>{T.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="farmer-form-close"
            type="button"
          >
            <X size={24} />
          </button>
        </div>
        <div className="farmer-form-header__meta">
          <span>Step {currentStep}</span>
          <span className="farmer-form-header__divider" />
          <span>{T.steps[currentStep - 1]}</span>
        </div>

        <div className="form-progress">
          <div className="form-progress__chips">
            {T.steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              return (
                <div
                  key={step}
                  className={`form-progress__chip${isActive ? ' is-active' : ''}${isCompleted ? ' is-complete' : ''}`}
                >
                  <span className="form-progress__number">{index + 1}</span>
                  <span className="form-progress__label">{step}</span>
                </div>
              );
            })}
          </div>
          <div className="form-progress__bar">
            <motion.div
              className="form-progress__bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / T.steps.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 25 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="farmer-form-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="form-steps"
            >
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <FormCard>
                  <SectionTitle>{T.steps[0]}</SectionTitle>
                  <div className="form-grid form-grid--two">
                    <InputField name="fullName" label={T.labels.fullName} value={formData.fullName} onChange={handleChange} />
                    <InputField name="fatherSpouseName" label={T.labels.fatherSpouseName} value={formData.fatherSpouseName} onChange={handleChange} />
                    <SelectField name="gender" label={T.labels.gender} value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                    <InputField name="dob" label={T.labels.dob} value={formData.dob} onChange={handleChange} type="date" placeholder="dd-mm-yyyy" />
                    <InputField name="contactNumber" label={T.labels.contactNumber} value={formData.contactNumber} onChange={handleChange} type="tel" />
                    <InputField name="email" label={T.labels.email} value={formData.email} onChange={handleChange} type="email" />
                    <InputField name="aadhaar" label={T.labels.aadhaar} value={formData.aadhaar} onChange={handleChange} />
                    <TextareaField name="address" label={T.labels.address} value={formData.address} onChange={handleChange} className="form-grid__full" />
                  </div>
                </FormCard>
              )}
              {/* Step 2: Farm Details */}
              {currentStep === 2 && (
                <FormCard>
                  <SectionTitle>{T.steps[1]}</SectionTitle>
                  <div className="form-grid form-grid--two">
                    <InputField name="landholding" label={T.labels.landholding} value={formData.landholding} onChange={handleChange} />
                    <InputField name="ownershipType" label={T.labels.ownershipType} value={formData.ownershipType} onChange={handleChange} />
                    <InputField name="irrigationSource" label={T.labels.irrigationSource} value={formData.irrigationSource} onChange={handleChange} />
                    <InputField name="soilType" label={T.labels.soilType} value={formData.soilType} onChange={handleChange} />
                    <TextareaField name="farmLocation" label={T.labels.farmLocation} value={formData.farmLocation} onChange={handleChange} className="form-grid__full" />
                  </div>
                </FormCard>
              )}
              {/* Step 3: Agricultural Information */}
              {currentStep === 3 && (
                <FormCard>
                  <SectionTitle>{T.steps[2]}</SectionTitle>
                  <div className="form-grid form-grid--two">
                    <InputField name="primaryCrops" label={T.labels.primaryCrops} value={formData.primaryCrops} onChange={handleChange} />
                    <InputField name="seasonalCrops" label={T.labels.seasonalCrops} value={formData.seasonalCrops} onChange={handleChange} />
                    <InputField name="averageYield" label={T.labels.averageYield} value={formData.averageYield} onChange={handleChange} />
                    <InputField name="farmingType" label={T.labels.farmingType} value={formData.farmingType} onChange={handleChange} />
                    <TextareaField name="livestock" label={T.labels.livestock} value={formData.livestock} onChange={handleChange} className="form-grid__full" />
                  </div>
                </FormCard>
              )}
              {/* Step 4: Financial & Market Details */}
              {currentStep === 4 && (
                <FormCard>
                  <SectionTitle>{T.steps[3]}</SectionTitle>
                  <div className="form-grid form-grid--two">
                    <InputField name="bankAccount" label={T.labels.bankAccount} value={formData.bankAccount} onChange={handleChange} />
                    <InputField name="paymentMode" label={T.labels.paymentMode} value={formData.paymentMode} onChange={handleChange} />
                    <InputField name="govtSchemes" label={T.labels.govtSchemes} value={formData.govtSchemes} onChange={handleChange} />
                    <TextareaField name="marketChannels" label={T.labels.marketChannels} value={formData.marketChannels} onChange={handleChange} className="form-grid__full" />
                  </div>
                </FormCard>
              )}
              {/* Step 5: Technology & Support */}
              {currentStep === 5 && (
                <FormCard>
                  <SectionTitle>{T.steps[4]}</SectionTitle>
                  <div className="form-grid form-grid--two">
                    <SelectField name="smartphoneAccess" label={T.labels.smartphoneAccess} value={formData.smartphoneAccess} onChange={handleChange} options={['Yes', 'No']} />
                    <InputField name="modernEquipment" label={T.labels.modernEquipment} value={formData.modernEquipment} onChange={handleChange} />
                    <TextareaField name="trainingNeeds" label={T.labels.trainingNeeds} value={formData.trainingNeeds} onChange={handleChange} className="form-grid__full" />
                  </div>
                </FormCard>
              )}
              {/* Step 6: Declaration */}
              {currentStep === 6 && (
                <FormCard>
                  <SectionTitle>{T.steps[5]}</SectionTitle>
                  <div className="form-declaration">
                    {T.labels.declaration}
                  </div>
                  <div className="form-grid form-grid--three">
                    <InputField name="signature" label={T.labels.signature} value={formData.signature} onChange={handleChange} />
                    <InputField name="date" label={T.labels.date} value={formData.date} onChange={handleChange} type="date" />
                    <InputField name="place" label={T.labels.place} value={formData.place} onChange={handleChange} />
                  </div>
                </FormCard>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        <div className="farmer-form-footer">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="form-btn form-btn--ghost"
          >
            {T.buttons.previous}
          </button>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="form-btn form-btn--primary"
            >
              {T.buttons.next}
            </button>
          ) : (
            <button
              type="submit"
              className="form-btn form-btn--success"
            >
              {T.buttons.submit}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ name, label, className = '', ...props }) => {
  const wrapperClass = ['form-field', className].filter(Boolean).join(' ');
  return (
    <div className={wrapperClass}>
      <label htmlFor={name} className="form-label">{label}</label>
      <input
        id={name}
        name={name}
        {...props}
        className="form-input"
      />
    </div>
  );
};

const TextareaField = ({ name, label, className = '', ...props }) => {
  const wrapperClass = ['form-field', className].filter(Boolean).join(' ');
  return (
    <div className={wrapperClass}>
      <label htmlFor={name} className="form-label">{label}</label>
      <textarea
        id={name}
        name={name}
        rows="3"
        {...props}
        className="form-input form-input--textarea"
      />
    </div>
  );
};

const SelectField = ({ name, label, options, className = '', ...props }) => {
  const wrapperClass = ['form-field', className].filter(Boolean).join(' ');
  return (
    <div className={wrapperClass}>
      <label htmlFor={name} className="form-label">{label}</label>
      <div className="form-select-wrapper">
        <select
          id={name}
          name={name}
          {...props}
          className="form-select"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className="form-select-icon" aria-hidden="true">▾</span>
      </div>
    </div>
  );
};

export default FarmerInfoForm;
