"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Language = "en" | "si";

/**
 * Explicit shape for every translation key. Defining this up front (rather
 * than inferring it from `as const` on the English object) keeps the
 * English and Sinhala dictionaries structurally interchangeable — with
 * `as const`, TypeScript locks in each literal string, so `si.languageToggle.label`
 * ("සිංහල") is a different *type* than `en.languageToggle.label` ("English"),
 * and the two objects stop being assignable to one another once the
 * dictionary gets deep enough. Typing both against this interface (plain
 * `string` leaves) avoids that entirely.
 */
interface TimelineEvent {
  title: string;
  description: string;
}

interface GoodToKnowItem {
  title: string;
  description: string;
}

export interface Translations {
  languageToggle: { label: string; aria: string };
  intro: {
    weddingOf: string;
    gettingMarried: string;
    openInvitation: string;
    skipIntro: string;
  };
  hero: {
    togetherWithFamilies: string;
    gettingMarried: string;
    dayLabel: string;
    dateVenueSeparator: string;
    scroll: string;
  };
  countdown: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  details: {
    withGreatJoy: string;
    heading: string;
    bride: string;
    groom: string;
    belovedDaughterOf: string;
    belovedSonOf: string;
    contactBride: string;
    contactGroom: string;
    poruwaCeremony: string;
    commencesAt: string;
    poruwaDescSuffix: string;
    rsvpBy: string;
  };
  timeline: {
    bigDay: string;
    heading: string;
    events: TimelineEvent[];
  };
  venue: {
    joinUsAt: string;
    location: string;
    getDirections: string;
  };
  gallery: {
    ourStory: string;
    heading: string;
    view: string;
  };
  rsvp: {
    kindlyRespond: string;
    heading: string;
    respondBy: string;
    thankYou: string;
    received: string;
    downloadInvitation: string;
    autoDownloadNote: string;
    submitAnother: string;
    fullName: string;
    fullNamePlaceholder: string;
    willAttend: string;
    attending: string;
    declining: string;
    guestCount: string;
    email: string;
    emailPlaceholder: string;
    emailNote: string;
    phone: string;
    phonePlaceholder: string;
    message: string;
    messagePlaceholder: string;
    uploadPhoto: string;
    choosePhoto: string;
    photoRequiredNote: string;
    errorNameEmail: string;
    errorEmailInvalid: string;
    errorPhotoSize: string;
    errorRequiredFields: string;
    errorPhotoRequired: string;
    submitting: string;
    send: string;
  };
  guestWall: {
    joining: string;
    heading: string;
    loading: string;
    empty: string;
  };
  memories: {
    label: string;
    heading: string;
    subheading: string;
    relatedTo: string;
    couple: string;
    bride: string;
    groom: string;
    comment: string;
    commentPlaceholder: string;
    uploadPhoto: string;
    choosePhoto: string;
    submit: string;
    submitting: string;
    thankYou: string;
    received: string;
    addAnother: string;
    errorRequired: string;
    errorPhotoSize: string;
    wallLabel: string;
    wallHeading: string;
    wallEmpty: string;
    wallLoading: string;
  };
  goodToKnow: {
    label: string;
    heading: string;
    items: GoodToKnowItem[];
  };
  footer: {
    dateMadeWithLove: string;
  };
}

/**
 * All translatable copy lives here. Proper nouns — the couple's names,
 * parents' names, the venue name, phone numbers — are intentionally left
 * out of this dictionary and hard-coded in the components, since they
 * should never be translated.
 */
export const translations: Record<Language, Translations> = {
  en: {
    languageToggle: { label: "සිංහල", aria: "Switch to Sinhala" },
    intro: {
      weddingOf: "The Wedding Of",
      gettingMarried: "are getting married",
      openInvitation: "Click to Open Invitation",
      skipIntro: "Skip Intro",
    },
    hero: {
      togetherWithFamilies: "Together With Their Families",
      gettingMarried: "are getting married",
      dayLabel: "Thursday",
      dateVenueSeparator: "·",
      scroll: "Scroll",
    },
    countdown: {
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
    },
    details: {
      withGreatJoy: "With Great Joy",
      heading: "We Invite You To Celebrate",
      bride: "The Bride",
      groom: "The Groom",
      belovedDaughterOf: "Beloved daughter of",
      belovedSonOf: "Beloved son of",
      contactBride: "Contact Bride",
      contactGroom: "Contact Groom",
      poruwaCeremony: "Poruwa Ceremony",
      commencesAt: "Commences at",
      poruwaDescSuffix:
        "on Thursday, 22nd October 2026, following traditional Sri Lankan rituals at Monarch Imperial, Sri Jayawardenepura Kotte.",
      rsvpBy: "Kindly RSVP by 10th October 2026",
    },
    timeline: {
      bigDay: "The Big Day",
      heading: "Order Of The Day",
      events: [
        {
          title: "Poruwa Ceremony",
          description:
            "Traditional rituals begin — the event officially opens",
        },
        {
          title: "Registration & Cake Cutting",
          description:
            "Guest registration, followed by the cake cutting & toast",
        },
        {
          title: "Buffet Lunch",
          description: "A feast for family & friends",
        },
        {
          title: "Music & Celebration",
          description: "Dancing the afternoon away",
        },
        {
          title: "Blessings & Photography",
          description: "Family blessings & cherished moments",
        },
        {
          title: "Couple's Grand Exit",
          description: "The newlyweds make their special exit",
        },
      ],
    },
    venue: {
      joinUsAt: "Join Us At",
      location: "Sri Jayawardenepura Kotte, Sri Lanka",
      getDirections: "Get Directions",
    },
    gallery: {
      ourStory: "Our Story",
      heading: "Moments We Cherish",
      view: "View",
    },
    rsvp: {
      kindlyRespond: "Kindly Respond",
      heading: "RSVP",
      respondBy: "Please respond by 10th October 2026",
      thankYou: "Thank You!",
      received:
        "Your RSVP has been received. A confirmation with the wedding details is on its way to your email.",
      downloadInvitation: "Download Your Invitation",
      autoDownloadNote: "Your invitation will download automatically in a few seconds.",
      submitAnother: "Submit Another Response",
      fullName: "Full Name",
      fullNamePlaceholder: "Your full name",
      willAttend: "Will You Be Attending?",
      attending: "Joyfully Attending",
      declining: "Regretfully Declining",
      guestCount: "Number of Guests Attending",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      emailNote: "We'll send your RSVP confirmation and wedding details here.",
      phone: "Mobile Number",
      phonePlaceholder: "07X XXX XXXX",
      message: "Message / Wishes For The Couple",
      messagePlaceholder: "Share your wishes...",
      uploadPhoto: "Upload Your Photo",
      choosePhoto: "Choose an image (max 5MB)",
      photoRequiredNote: "A photo is required with your RSVP.",
      errorNameEmail: "Please fill in your name and email address.",
      errorEmailInvalid: "Please enter a valid email address.",
      errorPhotoSize: "Photo must be smaller than 5MB.",
      errorRequiredFields:
        "Please fill in your name, email, phone number, and upload a photo.",
      errorPhotoRequired: "Please upload a photo to complete your RSVP.",
      submitting: "Submitting...",
      send: "Send RSVP",
    },
    guestWall: {
      joining: "Joining The Celebration",
      heading: "Our Guests",
      loading: "Loading well-wishers...",
      empty: "Be the first to RSVP and appear here!",
    },
    memories: {
      label: "Share A Moment",
      heading: "Add Your Memories",
      subheading:
        "Share a photo with the couple and a few words — it'll appear on our Memories wall for everyone to see.",
      relatedTo: "This Memory Is With",
      couple: "The Couple",
      bride: "The Bride",
      groom: "The Groom",
      comment: "Your Message",
      commentPlaceholder: "Tell us about this moment...",
      uploadPhoto: "Upload A Photo",
      choosePhoto: "Choose an image (max 5MB)",
      submit: "Share Memory",
      submitting: "Sharing...",
      thankYou: "Memory Shared!",
      received: "Thank you for sharing — it now lives on our Memories wall.",
      addAnother: "Share Another Memory",
      errorRequired: "Please add a photo and a short message.",
      errorPhotoSize: "Photo must be smaller than 5MB.",
      wallLabel: "From Our Loved Ones",
      wallHeading: "Memories Wall",
      wallEmpty: "Be the first to share a memory — add yours in the RSVP form above!",
      wallLoading: "Loading memories...",
    },
    goodToKnow: {
      label: "A Few Notes",
      heading: "Good To Know",
      items: [
        {
          title: "Dress Code",
          description:
            "No specific dress code — come as you are! If you'd like to match our wedding colour, we'd love to see you in shades of Ruby Red.",
        },
        {
          title: "Parking",
          description:
            "Complimentary valet and self-parking are available at Monarch Imperial for all guests.",
        },
        {
          title: "Kids & Plus-Ones",
          description:
            "We love your little ones! Please let us know in your RSVP message how many are joining, including children.",
        },
        {
          title: "Gifts",
          description:
            "Your presence is the greatest gift. Should you wish to give more, a small envelope box will be at the entrance.",
        },
        {
          title: "Photography",
          description:
            "We'll have a photographer capturing every moment — feel free to take your own too and tag us on the day!",
        },
        {
          title: "Weather",
          description:
            "The ceremony includes some outdoor moments — a light shawl or umbrella is handy during October showers.",
        },
      ],
    },
    footer: {
      dateMadeWithLove: "22nd October 2026 · Made with love",
    },
  },
  si: {
    languageToggle: { label: "English", aria: "ඉංග්‍රීසි භාෂාවට මාරු වන්න" },
    intro: {
      weddingOf: "විවාහ මංගල්‍යය",
      gettingMarried: "විවාහ දිවියට එළැඹෙති",
      openInvitation: "ආරාධනා පත්‍රය විවෘත කිරීමට ක්ලික් කරන්න",
      skipIntro: "හඳුන්වාදීම මඟහරින්න",
    },
    hero: {
      togetherWithFamilies: "පවුල් සමඟ එකාබද්ධව",
      gettingMarried: "විවාහ දිවියට එළැඹෙති",
      dayLabel: "බ්‍රහස්පතින්දා",
      dateVenueSeparator: "·",
      scroll: "පහළට යන්න",
    },
    countdown: {
      days: "දවස්",
      hours: "පැය",
      minutes: "මිනිත්තු",
      seconds: "තත්පර",
    },
    details: {
      withGreatJoy: "මහත් සතුටින්",
      heading: "සැමරීමට ඔබට ආරාධනා කරමු",
      bride: "මනාලිය",
      groom: "මනාලයා",
      belovedDaughterOf: "ආදරණීය දියණිය",
      belovedSonOf: "ආදරණීය පුත්‍රයා",
      contactBride: "මනාලිය අමතන්න",
      contactGroom: "මනාලයා අමතන්න",
      poruwaCeremony: "පොරුව මංගල්‍යය",
      commencesAt: "ආරම්භ වන්නේ",
      poruwaDescSuffix:
        "2026 ඔක්තෝබර් 22 වන බ්‍රහස්පතින්දා, සම්ප්‍රදායික ශ්‍රී ලාංකික චාරිත්‍ර අනුගමනය කරමින්, Monarch Imperial, ශ්‍රී ජයවර්ධනපුර කෝට්ටේ දී.",
      rsvpBy: "කරුණාකර 2026 ඔක්තෝබර් 10 වන දිනට පෙර RSVP කරන්න",
    },
    timeline: {
      bigDay: "විශේෂ දිනය",
      heading: "දින සැලැස්ම",
      events: [
        {
          title: "පොරුව මංගල්‍යය",
          description: "සම්ප්‍රදායික චාරිත්‍ර ආරම්භ වේ — උත්සවය නිල වශයෙන් විවෘත වේ",
        },
        {
          title: "ලියාපදිංචිය සහ කේක් කැපීම",
          description: "අමුත්තන් ලියාපදිංචි කිරීමෙන් පසු කේක් කැපීම සහ ටෝස්ට් එක",
        },
        {
          title: "දිවා භෝජනය",
          description: "පවුලේ සහ මිතුරන් සඳහා විශේෂ භෝජන සංග්‍රහයක්",
        },
        {
          title: "සංගීතය සහ සැමරුම",
          description: "සවස වන තෙක් නර්තනයෙන් සැමරීම",
        },
        {
          title: "ආශිර්වාද සහ ඡායාරූප",
          description: "පවුලේ ආශිර්වාද සහ අගනා මොහොත්",
        },
        {
          title: "යුවළගේ විශේෂ පිටවීම",
          description: "අලුත උපත් යුවළ ඔවුන්ගේ විශේෂ පිටවීම සිදු කරති",
        },
      ],
    },
    venue: {
      joinUsAt: "අප හා එක්වන්න",
      location: "ශ්‍රී ජයවර්ධනපුර කෝට්ටේ, ශ්‍රී ලංකාව",
      getDirections: "මාර්ග සොයන්න",
    },
    gallery: {
      ourStory: "අපගේ කතාව",
      heading: "අප සිතේ රැඳී ඇති මොහොත්",
      view: "බලන්න",
    },
    rsvp: {
      kindlyRespond: "කරුණාකර පිළිතුරු දෙන්න",
      heading: "RSVP",
      respondBy: "කරුණාකර 2026 ඔක්තෝබර් 10 වන දිනට පෙර පිළිතුරු දෙන්න",
      thankYou: "ස්තූතියි!",
      received:
        "ඔබගේ RSVP එක ලැබී ඇත. විවාහ මංගල්‍ය විස්තර සහිත තහවුරු කිරීමේ පණිවිඩයක් ඔබගේ විද්‍යුත් තැපෑලට එවනු ලැබේ.",
      downloadInvitation: "ඔබගේ ආරාධනා පත්‍රය බාගන්න",
      autoDownloadNote: "තත්පර කිහිපයකින් ඔබගේ ආරාධනා පත්‍රය ස්වයංක්‍රීයව බාගත වේ.",
      submitAnother: "තවත් පිළිතුරක් යොමු කරන්න",
      fullName: "සම්පූර්ණ නම",
      fullNamePlaceholder: "ඔබගේ සම්පූර්ණ නම",
      willAttend: "ඔබ පැමිණෙනවාද?",
      attending: "සතුටින් පැමිණෙමි",
      declining: "කණගාටුවෙන් නොපැමිණෙමි",
      guestCount: "පැමිණෙන අමුත්තන් සංඛ්‍යාව",
      email: "විද්‍යුත් තැපැල් ලිපිනය",
      emailPlaceholder: "you@example.com",
      emailNote: "ඔබගේ RSVP තහවුරු කිරීම සහ විවාහ විස්තර මෙතනට එවනු ලැබේ.",
      phone: "ජංගම දුරකථන අංකය",
      phonePlaceholder: "07X XXX XXXX",
      message: "පණිවිඩය / යුවළට සුබ පැතුම්",
      messagePlaceholder: "ඔබගේ සුබ පැතුම් ලියන්න...",
      uploadPhoto: "ඔබගේ ඡායාරූපය උඩුගත කරන්න",
      choosePhoto: "රූපයක් තෝරන්න (උපරිම 5MB)",
      photoRequiredNote: "ඔබගේ RSVP සමඟ ඡායාරූපයක් අනිවාර්යයෙන් අවශ්‍යයි.",
      errorNameEmail: "කරුණාකර ඔබගේ නම සහ විද්‍යුත් තැපැල් ලිපිනය පුරවන්න.",
      errorEmailInvalid: "කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",
      errorPhotoSize: "ඡායාරූපය 5MB ට වඩා කුඩා විය යුතුය.",
      errorRequiredFields:
        "කරුණාකර ඔබගේ නම, විද්‍යුත් තැපැල් ලිපිනය, දුරකථන අංකය පුරවා ඡායාරූපයක් උඩුගත කරන්න.",
      errorPhotoRequired: "කරුණාකර ඔබගේ RSVP සම්පූර්ණ කිරීමට ඡායාරූපයක් උඩුගත කරන්න.",
      submitting: "යොමු කරමින්...",
      send: "RSVP යවන්න",
    },
    guestWall: {
      joining: "සැමරුමට එක්වන අය",
      heading: "අපගේ අමුත්තන්",
      loading: "පූරණය වෙමින්...",
      empty: "පළමුව RSVP කර මෙහි දිස්වන්න!",
    },
    memories: {
      label: "මොහොතක් බෙදාගන්න",
      heading: "ඔබගේ මතක එක් කරන්න",
      subheading:
        "යුවළ සමඟ ඡායාරූපයක් සහ වචන කිහිපයක් බෙදාගන්න — එය අපගේ මතක බිත්තියේ සියල්ලන්ටම පෙනෙන පරිදි දිස්වනු ඇත.",
      relatedTo: "මෙම මතකය සම්බන්ධ වන්නේ",
      couple: "යුවළ සමඟ",
      bride: "මනාලිය සමඟ",
      groom: "මනාලයා සමඟ",
      comment: "ඔබගේ පණිවිඩය",
      commentPlaceholder: "මෙම මොහොත ගැන අපට කියන්න...",
      uploadPhoto: "ඡායාරූපයක් උඩුගත කරන්න",
      choosePhoto: "රූපයක් තෝරන්න (උපරිම 5MB)",
      submit: "මතකය බෙදාගන්න",
      submitting: "යොමු කරමින්...",
      thankYou: "මතකය බෙදාගන්නා ලදී!",
      received: "බෙදාගැනීම ගැන ස්තූතියි — එය දැන් අපගේ මතක බිත්තියේ ඇත.",
      addAnother: "තවත් මතකයක් බෙදාගන්න",
      errorRequired: "කරුණාකර ඡායාරූපයක් සහ කෙටි පණිවිඩයක් එක් කරන්න.",
      errorPhotoSize: "ඡායාරූපය 5MB ට වඩා කුඩා විය යුතුය.",
      wallLabel: "අපගේ ආදරණීයන්ගෙන්",
      wallHeading: "මතක බිත්තිය",
      wallEmpty: "පළමු මතකය බෙදාගන්නා තැනැත්තා ඔබ වන්න — ඉහත RSVP පෝරමයෙන් එක් කරන්න!",
      wallLoading: "මතක පූරණය වෙමින්...",
    },
    goodToKnow: {
      label: "දැනගැනීම සඳහා",
      heading: "දැනගත යුතු කරුණු",
      items: [
        {
          title: "ඇඳුම් රටාව",
          description:
            "විශේෂිත ඇඳුම් රටාවක් නැත — ඔබට කැමති ලෙස එන්න! අපගේ විවාහ වර්ණය වන රක්ත රතු (Ruby Red) පැහැයෙන් සැරසී ඒමට කැමති නම් අපි එයට කැමතියි.",
        },
        {
          title: "වාහන නැවැත්වීම",
          description:
            "Monarch Imperial හි සියලුම අමුත්තන් සඳහා නොමිලේ වැලට් සහ ස්වයං වාහන නැවැත්වීමේ පහසුකම් ඇත.",
        },
        {
          title: "දරුවන් සහ සහකරුවන්",
          description:
            "ඔබේ කුඩා දරුවන්ටද අපගේ ආදරය! කරුණාකර දරුවන් ඇතුළුව පැමිණෙන සංඛ්‍යාව RSVP පණිවිඩයේ සඳහන් කරන්න.",
        },
        {
          title: "තෑගි",
          description:
            "ඔබේ පැමිණීමම අපට වටිනාම තෑග්ගයි. තවත් ලබා දීමට කැමති නම්, ප්‍රවේශ ද්වාරයේ කුඩා පෙට්ටියක් තැබෙනු ඇත.",
        },
        {
          title: "ඡායාරූප",
          description:
            "සෑම මොහොතක්ම වෘත්තීය ඡායාරූප ශිල්පියෙකු විසින් සටහන් කරනු ලැබේ — ඔබත් ඡායාරූප ගෙන අප ටැග් කරන්න!",
        },
        {
          title: "කාලගුණය",
          description:
            "උත්සවයේ කොටසක් එළිමහනේ පැවැත්වේ — ඔක්තෝබර් වැසි සඳහා සැහැල්ලු ෂෝල් එකක් හෝ කුඩයක් රැගෙන එන්න.",
        },
      ],
    },
    footer: {
      dateMadeWithLove: "2026 ඔක්තෝබර් 22 · ආදරයෙන් සකසන ලදී",
    },
  },
};

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: Translations;
  /** True when the active language is Sinhala — handy for swapping fonts
   *  or dropping uppercase/letter-spacing styles that don't suit Sinhala. */
  isSinhala: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "wedding-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Restore the guest's last choice on return visits.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "si") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "si" : "en");

  const value: LanguageContextValue = {
    language,
    toggleLanguage,
    setLanguage,
    t: translations[language],
    isSinhala: language === "si",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
