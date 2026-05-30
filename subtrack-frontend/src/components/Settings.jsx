import { useState } from "react";
import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";
import NotificationSettings from "./NotificationSettings";
import { User, ShieldAlert, BellRing, Settings as SettingsIcon } from "lucide-react";
import * as styles from "../styles/common";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      name: "Profile details",
      description: "Manage credentials and names",
      icon: User,
      component: ProfileSettings,
    },
    {
      id: "security",
      name: "Password security",
      description: "Update account passcode security",
      icon: ShieldAlert,
      component: ChangePassword,
    },
    {
      id: "notifications",
      name: "Reminders & Alerts",
      description: "Set days before billing due notices",
      icon: BellRing,
      component: NotificationSettings,
    },
  ];

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Title */}
      <div>
        <h1 className={`${styles.pageTitleClass} flex items-center gap-3`}>
          <SettingsIcon className="w-8 h-8 text-[#0066cc] shrink-0" />
          Settings
        </h1>
        <p className={styles.mutedText}>
          Update credentials and adjust renewal alarms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Tab Selections */}
        <div className="bg-white border border-[#e8e8ed] rounded-2xl p-4 space-y-1">
          <p className="text-[10px] font-bold text-[#a1a1a6] uppercase tracking-wider px-3 mb-3">
            Settings Sections
          </p>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition cursor-pointer ${
                  active
                    ? "bg-[#0066cc]/5 text-[#0066cc] border-l-2 border-[#0066cc] rounded-l-none"
                    : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? "text-[#0066cc]" : "text-[#a1a1a6]"}`} />
                <div>
                  <h4 className="text-xs font-semibold leading-none">{tab.name}</h4>
                  <p className="text-[9.5px] text-[#a1a1a6] mt-1 font-semibold leading-none">{tab.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Render Tab Panel */}
        <div className="lg:col-span-3 transition-all duration-300">
          <div>
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
