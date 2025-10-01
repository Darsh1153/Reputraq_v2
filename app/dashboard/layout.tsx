"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  Newspaper,
  Building2,
  Bot,
  Search,
  Lightbulb,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  MoreVertical,
  Monitor,
  Hash,
  Play,
} from "lucide-react";
import FixedRefreshButton from "../../components/FixedRefreshButton";
import styles from "./layout.module.scss";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
  {
    id: "news",
    label: "News Blog Monitoring",
    icon: Newspaper,
    path: "/dashboard/news",
  },
  {
    id: "competitor",
    label: "Competitor Analysis",
    icon: Building2,
    path: "/dashboard/competitor",
  },
  {
    id: "keywords",
    label: "Keywords Management",
    icon: Search,
    path: "/dashboard/keywords",
  },
  {
    id: "social-listening-finder",
    label: "Social Listening Finder",
    icon: Monitor,
    path: "/dashboard/social-listening-finder",
  },
  {
    id: "hashtag-finder",
    label: "Hashtag Finder",
    icon: Hash,
    path: "/dashboard/hashtag-finder",
  },
  {
    id: "hashtag-tracker",
    label: "Hashtag Tracker",
    icon: Hash,
    path: "/dashboard/hashtag-tracker",
  },
  {
    id: "trending-mentions",
    label: "Trending Mentions Finder",
    icon: TrendingUp,
    path: "/dashboard/trending-mentions",
  },
  {
    id: "social-listening",
    label: "Social Listening Finder",
    icon: Monitor,
    path: "/dashboard/social-listening",
  },
  {
    id: "youtube-search",
    label: "YouTube Search",
    icon: Play,
    path: "/dashboard/youtube-search",
  },
  {
    id: "ai-orm-chatbot",
    label: "AI ORM Chatbot",
    icon: Bot,
    path: "/dashboard/ai-orm-chatbot",
  },
  {
    id: "insights",
    label: "Insights APITube",
    icon: Lightbulb,
    path: "/dashboard/insights",
  },
  {
    id: "test-features",
    label: "Test Features",
    icon: Settings,
    path: "/dashboard/test-features",
  },
  {
    id: "profile",
    label: "Profile Settings",
    icon: User,
    path: "/dashboard/profile",
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              {/* <div className={styles.logoShape}></div> */}
                <Image
                  src="/WhatsApp Image 2025-09-15 at 2.08.12 AM.jpeg"
                  alt="Logo"
                  width={30}
                  height={30}
                  priority={true}
                  className={styles.logoImage}
                />
            </div>
            {sidebarOpen && <h2 className={styles.logo}>Reputraq</h2>}
          </div>
          <button
            className={styles.toggleButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activePath === item.path;
              return (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    onClick={() => handleMenuClick(item.path)}
                    className={`${styles.menuButton} ${isActive ? styles.active : ""}`}
                  >
                    <span className={styles.menuIcon}>
                      <IconComponent size={16} />
                    </span>
                    {sidebarOpen && (
                      <>
                        <span className={styles.menuLabel}>{item.label}</span>
                        {item.badge && (
                          <span className={styles.menuBadge}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.settingsSection}>
            <button
              className={`${styles.settingsButton} ${activePath === "/dashboard/settings" ? styles.active : ""}`}
            >
              <span className={styles.menuIcon}>
                <Settings size={16} />
              </span>
              {sidebarOpen && (
                <span className={styles.menuLabel}>Settings</span>
              )}
            </button>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <div className={styles.avatarPlaceholder}>
                <User size={20} />
              </div>
            </div>
            {sidebarOpen && (
              <div className={styles.userInfo}>
                <div className={styles.userName}>Arshad Jamal</div>
                <div className={styles.userEmail}>john@reputraq.com</div>
                <button className={styles.userMenu}>
                  <MoreVertical size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>{children}</div>

      {/* Fixed Refresh Button */}
      <FixedRefreshButton />
    </div>
  );
}
