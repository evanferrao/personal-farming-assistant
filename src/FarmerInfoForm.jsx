import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SectionTitle = ({ children }) => (
  <div className="relative pl-6 mb-8">
    <span className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-gradient-to-b from-blue-500 via-sky-500 to-teal-400 shadow-[0_14px_36px_-18px_rgba(56,189,248,0.6)]" />
    <h3 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">{children}</h3>
    <div className="mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-blue-500/70 via-blue-400/30 to-transparent" />
  </div>
);

const FormCard = ({ children }) => (
  <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/70 shadow-[0_35px_70px_-40px_rgba(15,23,42,0.65)] px-6 py-8 md:px-10 md:py-10 space-y-8 backdrop-blur-sm">
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
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
    exit={{ scale: 0.9, y: 50, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="relative w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden rounded-3xl border border-white/10 dark:border-slate-800/50 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black shadow-[0_40px_80px_-40px_rgba(15,23,42,0.65)]"
      >
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 text-green-800 flex flex-col gap-6 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-green-800/70">
                <span className="h-[3px] w-8 rounded-full bg-white/60" />
                Farmer Profile
              </span>
              <h2 className="text-3xl font-semibold tracking-tight">{T.title}</h2>
              <p className="text-sm text-green-800/80 max-w-2xl leading-relaxed">{T.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="self-start md:self-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 text-green-800/90 transition-all duration-200 hover:bg-white/25 hover:text-green-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold tracking-widest uppercase text-green-800/70">
            <span>Step {currentStep}</span>
            <span className="h-[1px] flex-1 bg-white/30" />
            <span>{T.steps[currentStep - 1]}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="px-8 py-6 bg-white/80 dark:bg-slate-900/60 border-b border-white/40 dark:border-slate-800/60 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {T.steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-green-800 shadow-[0_14px_35px_-20px_rgba(37,99,235,0.6)]'
                      : isCompleted
                      ? 'bg-blue-50/80 text-blue-600 dark:bg-slate-800/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30'
                      : 'bg-white/70 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold ${
                      isActive
                        ? 'bg-white/25 text-green-800'
                        : isCompleted
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-200'
                        : 'bg-slate-100/80 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="whitespace-nowrap">{step}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/70 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shadow-[0_18px_40px_-20px_rgba(37,99,235,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / T.steps.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 25 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-8 pb-12 pt-8 space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <FormCard>
                  <SectionTitle>{T.steps[0]}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField name="fullName" label={T.labels.fullName} value={formData.fullName} onChange={handleChange} />
                    <InputField name="fatherSpouseName" label={T.labels.fatherSpouseName} value={formData.fatherSpouseName} onChange={handleChange} />
                    <SelectField name="gender" label={T.labels.gender} value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                    <InputField name="dob" label={T.labels.dob} value={formData.dob} onChange={handleChange} type="date" placeholder="dd-mm-yyyy" />
                    <InputField name="contactNumber" label={T.labels.contactNumber} value={formData.contactNumber} onChange={handleChange} type="tel" />
                    <InputField name="email" label={T.labels.email} value={formData.email} onChange={handleChange} type="email" />
                    <InputField name="aadhaar" label={T.labels.aadhaar} value={formData.aadhaar} onChange={handleChange} />
                    <TextareaField name="address" label={T.labels.address} value={formData.address} onChange={handleChange} className="md:col-span-2" />
                  </div>
                </FormCard>
              )}
              {/* Step 2: Farm Details */}
              {currentStep === 2 && (
                <FormCard>
                  <SectionTitle>{T.steps[1]}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField name="landholding" label={T.labels.landholding} value={formData.landholding} onChange={handleChange} />
                    <InputField name="ownershipType" label={T.labels.ownershipType} value={formData.ownershipType} onChange={handleChange} />
                    <InputField name="irrigationSource" label={T.labels.irrigationSource} value={formData.irrigationSource} onChange={handleChange} />
                    <InputField name="soilType" label={T.labels.soilType} value={formData.soilType} onChange={handleChange} />
                    <TextareaField name="farmLocation" label={T.labels.farmLocation} value={formData.farmLocation} onChange={handleChange} className="md:col-span-2" />
                  </div>
                </FormCard>
              )}
              {/* Step 3: Agricultural Information */}
              {currentStep === 3 && (
                <FormCard>
                  <SectionTitle>{T.steps[2]}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField name="primaryCrops" label={T.labels.primaryCrops} value={formData.primaryCrops} onChange={handleChange} />
                    <InputField name="seasonalCrops" label={T.labels.seasonalCrops} value={formData.seasonalCrops} onChange={handleChange} />
                    <InputField name="averageYield" label={T.labels.averageYield} value={formData.averageYield} onChange={handleChange} />
                    <InputField name="farmingType" label={T.labels.farmingType} value={formData.farmingType} onChange={handleChange} />
                    <TextareaField name="livestock" label={T.labels.livestock} value={formData.livestock} onChange={handleChange} className="md:col-span-2" />
                  </div>
                </FormCard>
              )}
              {/* Step 4: Financial & Market Details */}
              {currentStep === 4 && (
                <FormCard>
                  <SectionTitle>{T.steps[3]}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField name="bankAccount" label={T.labels.bankAccount} value={formData.bankAccount} onChange={handleChange} />
                    <InputField name="paymentMode" label={T.labels.paymentMode} value={formData.paymentMode} onChange={handleChange} />
                    <InputField name="govtSchemes" label={T.labels.govtSchemes} value={formData.govtSchemes} onChange={handleChange} />
                    <TextareaField name="marketChannels" label={T.labels.marketChannels} value={formData.marketChannels} onChange={handleChange} className="md:col-span-2" />
                  </div>
                </FormCard>
              )}
              {/* Step 5: Technology & Support */}
              {currentStep === 5 && (
                <FormCard>
                  <SectionTitle>{T.steps[4]}</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <SelectField name="smartphoneAccess" label={T.labels.smartphoneAccess} value={formData.smartphoneAccess} onChange={handleChange} options={['Yes', 'No']} />
                    <InputField name="modernEquipment" label={T.labels.modernEquipment} value={formData.modernEquipment} onChange={handleChange} />
                    <TextareaField name="trainingNeeds" label={T.labels.trainingNeeds} value={formData.trainingNeeds} onChange={handleChange} className="md:col-span-2" />
                  </div>
                </FormCard>
              )}
              {/* Step 6: Declaration */}
              {currentStep === 6 && (
                <FormCard>
                  <SectionTitle>{T.steps[5]}</SectionTitle>
                  <div className="rounded-3xl border border-blue-200/50 dark:border-blue-500/30 bg-gradient-to-r from-blue-50/60 via-white/60 to-transparent dark:from-slate-800/60 dark:via-slate-900/40 px-5 py-4 md:px-7 md:py-5 mb-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {T.labels.declaration}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField name="signature" label={T.labels.signature} value={formData.signature} onChange={handleChange} />
                    <InputField name="date" label={T.labels.date} value={formData.date} onChange={handleChange} type="date" />
                    <InputField name="place" label={T.labels.place} value={formData.place} onChange={handleChange} />
                  </div>
                </FormCard>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Footer / Navigation */}
        <div className="px-8 py-6 bg-white/90 dark:bg-slate-950/60 border-t border-white/60 dark:border-slate-800/60 flex justify-between items-center flex-shrink-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="group px-6 py-3 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 backdrop-blur-sm transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed hover:border-slate-300/80 hover:shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)]"
          >
            {T.buttons.previous}
          </button>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl text-green-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 shadow-[0_18px_45px_-24px_rgba(37,99,235,0.8)] transition-all duration-200 hover:shadow-[0_18px_45px_-18px_rgba(37,99,235,0.8)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40"
            >
              {T.buttons.next}
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl text-green-800 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 shadow-[0_18px_45px_-24px_rgba(16,185,129,0.7)] transition-all duration-200 hover:shadow-[0_18px_45px_-18px_rgba(16,185,129,0.7)] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
            >
              {T.buttons.submit}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ name, label, className, ...props }) => (
  <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
    <label htmlFor={name} className="block text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-300 uppercase">{label}</label>
    <input
      id={name}
      name={name}
      {...props}
      className="w-full rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 px-4 py-3 text-base text-slate-700 dark:text-slate-200 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40 focus:border-blue-400/60 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
    />
  </div>
);

const TextareaField = ({ name, label, className, ...props }) => (
  <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
    <label htmlFor={name} className="block text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-300 uppercase">{label}</label>
    <textarea
      id={name}
      name={name}
      rows="3"
      {...props}
      className="w-full rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 px-4 py-3 text-base text-slate-700 dark:text-slate-200 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40 focus:border-blue-400/60 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
    />
  </div>
);

const SelectField = ({ name, label, options, className, ...props }) => (
  <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
    <label htmlFor={name} className="block text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-300 uppercase">{label}</label>
    <div className="relative">
      <select
        id={name}
        name={name}
        {...props}
        className="w-full appearance-none rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/60 px-4 py-3 text-base text-slate-700 dark:text-slate-200 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40 focus:border-blue-400/60 transition-all duration-200"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 text-sm">▾</span>
    </div>
  </div>
);

export default FarmerInfoForm;
