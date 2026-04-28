/* Flat chunky toy illustrations for the hero */

function ToyBlocks({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* shadow */}
      <ellipse cx="100" cy="172" rx="72" ry="8" fill="#000" opacity=".12"/>
      {/* green block bottom */}
      <rect x="38" y="108" width="64" height="56" rx="6" fill="#4FA36A"/>
      <circle cx="54" cy="102" r="7" fill="#4FA36A"/>
      <circle cx="70" cy="102" r="7" fill="#4FA36A"/>
      <circle cx="86" cy="102" r="7" fill="#4FA36A"/>
      {/* red block bottom */}
      <rect x="108" y="108" width="54" height="56" rx="6" fill="#EC5D4A"/>
      <circle cx="122" cy="102" r="7" fill="#EC5D4A"/>
      <circle cx="138" cy="102" r="7" fill="#EC5D4A"/>
      <circle cx="154" cy="102" r="7" fill="#EC5D4A"/>
      {/* yellow block top */}
      <rect x="68" y="52" width="64" height="56" rx="6" fill="#F5C443"/>
      <circle cx="84" cy="46" r="7" fill="#F5C443"/>
      <circle cx="100" cy="46" r="7" fill="#F5C443"/>
      <circle cx="116" cy="46" r="7" fill="#F5C443"/>
      {/* highlight */}
      <rect x="42" y="112" width="18" height="4" rx="2" fill="#fff" opacity=".35"/>
      <rect x="72" y="56" width="18" height="4" rx="2" fill="#fff" opacity=".35"/>
      <rect x="112" y="112" width="18" height="4" rx="2" fill="#fff" opacity=".35"/>
    </svg>
  );
}

function ToyCar({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="170" rx="72" ry="6" fill="#000" opacity=".15"/>
      {/* body */}
      <path d="M30 130 L30 110 Q30 100 40 100 L60 100 L78 68 Q82 60 92 60 L140 60 Q148 60 152 66 L172 100 L180 108 Q184 112 184 118 L184 130 Q184 140 174 140 L40 140 Q30 140 30 130 Z" fill="#EC5D4A"/>
      {/* window */}
      <path d="M82 72 Q85 68 90 68 L138 68 Q142 68 145 72 L158 98 L74 98 Z" fill="#FBF4E8"/>
      <rect x="108" y="70" width="4" height="28" fill="#EC5D4A"/>
      {/* headlight */}
      <circle cx="168" cy="115" r="7" fill="#F5C443"/>
      {/* door line */}
      <rect x="108" y="102" width="3" height="32" fill="#C74234" opacity=".4"/>
      {/* wheels */}
      <circle cx="62" cy="142" r="18" fill="#1F2F4A"/>
      <circle cx="62" cy="142" r="8" fill="#F5C443"/>
      <circle cx="150" cy="142" r="18" fill="#1F2F4A"/>
      <circle cx="150" cy="142" r="8" fill="#F5C443"/>
      {/* shine */}
      <rect x="86" y="74" width="16" height="4" rx="2" fill="#fff" opacity=".6"/>
    </svg>
  );
}

function ToyBear({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="178" rx="56" ry="5" fill="#000" opacity=".12"/>
      {/* ears */}
      <circle cx="58" cy="58" r="22" fill="#C88B5C"/>
      <circle cx="58" cy="58" r="12" fill="#E6B387"/>
      <circle cx="142" cy="58" r="22" fill="#C88B5C"/>
      <circle cx="142" cy="58" r="12" fill="#E6B387"/>
      {/* body */}
      <ellipse cx="100" cy="138" rx="50" ry="40" fill="#C88B5C"/>
      <ellipse cx="100" cy="140" rx="30" ry="22" fill="#E6B387"/>
      {/* head */}
      <circle cx="100" cy="92" r="48" fill="#C88B5C"/>
      {/* muzzle */}
      <ellipse cx="100" cy="108" rx="22" ry="16" fill="#E6B387"/>
      {/* nose */}
      <ellipse cx="100" cy="98" rx="6" ry="5" fill="#1F2F4A"/>
      {/* mouth */}
      <path d="M92 110 Q100 116 108 110" stroke="#1F2F4A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* eyes */}
      <circle cx="82" cy="82" r="4" fill="#1F2F4A"/>
      <circle cx="118" cy="82" r="4" fill="#1F2F4A"/>
      <circle cx="83" cy="80" r="1.4" fill="#fff"/>
      <circle cx="119" cy="80" r="1.4" fill="#fff"/>
      {/* cheeks */}
      <circle cx="72" cy="98" r="5" fill="#EC5D4A" opacity=".4"/>
      <circle cx="128" cy="98" r="5" fill="#EC5D4A" opacity=".4"/>
      {/* bow tie */}
      <path d="M86 152 L76 146 L76 160 Z" fill="#EC5D4A"/>
      <path d="M114 152 L124 146 L124 160 Z" fill="#EC5D4A"/>
      <circle cx="100" cy="152" r="5" fill="#C74234"/>
    </svg>
  );
}

function ToyRocket({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="178" rx="36" ry="5" fill="#000" opacity=".15"/>
      {/* flames */}
      <path d="M86 150 Q86 170 100 180 Q114 170 114 150 Z" fill="#F5C443"/>
      <path d="M92 150 Q92 166 100 174 Q108 166 108 150 Z" fill="#EC5D4A"/>
      {/* body */}
      <path d="M70 80 Q70 40 100 20 Q130 40 130 80 L130 150 L70 150 Z" fill="#FBF4E8"/>
      <path d="M70 80 Q70 40 100 20 Q130 40 130 80 L130 150 L70 150 Z" stroke="#1F2F4A" strokeWidth="3" fill="none"/>
      {/* tip */}
      <path d="M100 20 Q130 40 130 80 L100 80 Z" fill="#EC5D4A"/>
      {/* porthole */}
      <circle cx="100" cy="92" r="16" fill="#6FB8D9"/>
      <circle cx="100" cy="92" r="16" stroke="#1F2F4A" strokeWidth="3" fill="none"/>
      <circle cx="94" cy="86" r="4" fill="#fff" opacity=".7"/>
      {/* fins */}
      <path d="M70 120 L48 150 L70 150 Z" fill="#4FA36A"/>
      <path d="M70 120 L48 150 L70 150 Z" stroke="#1F2F4A" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <path d="M130 120 L152 150 L130 150 Z" fill="#4FA36A"/>
      <path d="M130 120 L152 150 L130 150 Z" stroke="#1F2F4A" strokeWidth="3" strokeLinejoin="round" fill="none"/>
      {/* details */}
      <rect x="86" y="124" width="28" height="8" rx="4" fill="#F5C443"/>
      <rect x="86" y="124" width="28" height="8" rx="4" stroke="#1F2F4A" strokeWidth="2" fill="none"/>
      {/* star */}
      <circle cx="40" cy="40" r="3" fill="#F5C443"/>
      <circle cx="165" cy="55" r="3" fill="#F5C443"/>
      <circle cx="170" cy="95" r="2" fill="#F5C443"/>
    </svg>
  );
}

window.SK_TOYS = { ToyBlocks, ToyCar, ToyBear, ToyRocket };
