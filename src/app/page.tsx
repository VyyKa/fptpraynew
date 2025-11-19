"use client";

import Image from "next/image";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Status = "idle" | "sending" | "success" | "error";

type PetalConfig = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
};

const HERO_MESSAGE =
  "✨ Để tiếp nối các sư huynh đi trước, website này đã được hậu bối đời k18 tiếp nối và tiếp tục lưu truyền. Mong website sẽ một phần nào đó tiếp thêm “sức mạnh” cho các bạn để vượt qua mọi kì thi nhé!";

type PassConfig = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
  rotate: number;
};

type ItemType = "altar" | "incense";

type Item = {
  id: string;
  name: string;
  type: ItemType;
  src: string;
  unlockMerit: number;
};

const ITEMS: Item[] = [
  // Altars
  { id: "altar_default", name: "Bàn thờ Vàng", type: "altar", src: "/bantho.png", unlockMerit: 0 },
  { id: "altar_jade", name: "Bàn thờ Ngọc", type: "altar", src: "/bantho_jade.png", unlockMerit: 10 },
  { id: "altar_diamond", name: "Bàn thờ Kim Cương", type: "altar", src: "/bantho_diamond.png", unlockMerit: 30 },

  // Incense
  { id: "incense_default", name: "Nhang Thường", type: "incense", src: "/bonhang.png", unlockMerit: 0 },
  { id: "incense_dragon", name: "Nhang Rồng", type: "incense", src: "/bonhang_dragon.png", unlockMerit: 5 },
  { id: "incense_lotus", name: "Nhang Sen", type: "incense", src: "/bonhang_lotus.png", unlockMerit: 15 },
];

const MAJORS = [
  "Kỹ thuật phần mềm",
  "An toàn thông tin",
  "Trí tuệ nhân tạo",
  "Thiết kế đồ họa",
  "Quản trị kinh doanh",
  "Digital Marketing",
  "Truyền thông đa phương tiện",
  "Ngôn ngữ Anh",
  "Ngôn ngữ Nhật",
  "Ngôn ngữ Hàn",
  "Khác",
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [wish, setWish] = useState("");
  const [major, setMajor] = useState(MAJORS[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastWish, setLastWish] = useState<{ email: string; wish: string } | null>(null);
  const [showOffering, setShowOffering] = useState(false);
  const [alertState, setAlertState] = useState<{
    message: string;
    type: "success" | "error" | "info";
    title?: string;
  } | null>(null);
  const [heroText, setHeroText] = useState("");
  const [merit, setMerit] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNewFeatureTooltip, setShowNewFeatureTooltip] = useState(true);
  const [equippedItems, setEquippedItems] = useState<{
    altar: string;
    incense: string;
  }>({
    altar: "altar_default",
    incense: "incense_default",
  });

  useEffect(() => {
    const storedMerit = localStorage.getItem("fptpray_merit");
    if (storedMerit) setMerit(parseInt(storedMerit, 10));

    const storedEquipped = localStorage.getItem("fptpray_equipped");
    if (storedEquipped) {
      const parsed = JSON.parse(storedEquipped);
      // Remove vase if it exists in old data
      setEquippedItems({
        altar: parsed.altar || "altar_default",
        incense: parsed.incense || "incense_default",
      });
    }
  }, []);

  const handleEquip = (item: Item) => {
    const newEquipped = { ...equippedItems, [item.type]: item.id };
    setEquippedItems(newEquipped);
    localStorage.setItem("fptpray_equipped", JSON.stringify(newEquipped));
  };

  const openAlert = useCallback(
    (message: string, type: "success" | "error" | "info" = "error", title?: string) => {
      setAlertState({ message, type, title });
    },
    [],
  );

  const closeAlert = useCallback(() => {
    setAlertState(null);
  }, []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const petals = useMemo<PetalConfig[]>(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: (index * 2.5) % 100,
        delay: (index * 0.25) % 3,
        duration: 8 + ((index * 2) % 5),
        scale: 0.8 + (index % 4) * 0.1,
      })),
    [],
  );

  const passBadges = useMemo<PassConfig[]>(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: (index * 6) % 100,
        delay: (index * 0.8) % 9,
        duration: 18 + (index % 5) * 3,
        scale: 0.7 + (index % 4) * 0.1,
        rotate: -20 + (index % 6) * 8,
      })),
    [],
  );

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const redirectUrl = process.env.NEXT_PUBLIC_DEVTOOLS_REDIRECT;
    if (!redirectUrl) {
      return;
    }

    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return;
    }

    let redirected = false;
    const triggerRedirect = () => {
      if (redirected) {
        return;
      }
      redirected = true;
      window.location.href = redirectUrl;
    };

    const threshold = 160;
    const detectDevtools = () => {
      if (redirected) {
        return;
      }
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      if (widthDiff > threshold || heightDiff > threshold) {
        triggerRedirect();
      }
    };

    const keyListener = (event: KeyboardEvent) => {
      if (event.key === "F12") {
        event.preventDefault();
        triggerRedirect();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (event.key === "I" || event.key === "J")
      ) {
        event.preventDefault();
        triggerRedirect();
      }
    };

    window.addEventListener("resize", detectDevtools);
    window.addEventListener("keydown", keyListener);
    const intervalId = window.setInterval(detectDevtools, 500);

    return () => {
      window.removeEventListener("resize", detectDevtools);
      window.removeEventListener("keydown", keyListener);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setHeroText(HERO_MESSAGE.slice(0, index));
      if (index >= HERO_MESSAGE.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const triggerEffects = useCallback(() => {
    setShowOffering(true);

    if (!audioRef.current) {
      audioRef.current = new Audio("/backgound.mp3");
      audioRef.current.loop = false;
      audioRef.current.volume = 0.7;
    }

    try {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    } catch (error) {
      console.warn("Không thể phát audio:", error);
    }
  }, []);

  const validateForm = () => {
    const normalizedEmail = email.trim();
    const normalizedWish = wish.trim();

    if (!normalizedEmail || !normalizedWish) {
      openAlert("Bạn chưa nhập đầy đủ email và lời nguyện.");
      return false;
    }

    const emailRegex =
      /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/i;
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 64) {
      openAlert(
        "Email không hợp lệ. Hãy nhập đúng định dạng ví dụ name@fpt.com.vn (tối đa 64 ký tự).",
      );
      return false;
    }

    if (normalizedWish.length < 5) {
      openAlert("Lời nguyện phải ít nhất 5 ký tự.");
      return false;
    }

    if (normalizedWish.length > 1200) {
      openAlert("Lời nguyện tối đa 1200 ký tự.");
      return false;
    }

    return { normalizedEmail, normalizedWish };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    const validated = validateForm();
    if (!validated) {
      return;
    }
    const { normalizedEmail, normalizedWish } = validated;

    setStatus("sending");
    setFeedback(null);

    try {
      const gasEndpoint = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;
      if (gasEndpoint) {
        await fetch(gasEndpoint, {
          method: "POST",
          mode: "no-cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            monguoc: normalizedWish,
            nganh: major,
          }),
        });
      } else {
        throw new Error("Chưa cấu hình đường dẫn Google Apps Script.");
      }

      setStatus("success");
      setFeedback(`Mong ước ${normalizedWish} của ${normalizedEmail} đã được gửi!`);
      setLastWish({ email: normalizedEmail, wish: normalizedWish });
      triggerEffects();
      setEmail("");
      setWish("");

      // --- Merit System Logic ---
      const today = new Date().toDateString();
      // const lastPrayed = localStorage.getItem("fptpray_last_prayed");

      // Always increment merit
      const currentMerit = parseInt(localStorage.getItem("fptpray_merit") || "0", 10);
      const newMerit = currentMerit + 1;
      localStorage.setItem("fptpray_merit", newMerit.toString());
      localStorage.setItem("fptpray_last_prayed", today);
      setMerit(newMerit);
      openAlert(
        `Bạn nhận được 1 công đức! Tổng: ${newMerit}`,
        "success",
        "Tích đức thành công"
      );
      // --------------------------

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi bất ngờ. Bạn thử lại sau giúp nhé!";
      setStatus("error");
      setFeedback(message);
      openAlert(message);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#7b3f00]">
      <div className="hero-banner">
        <span className="hero-banner-text">{heroText}</span>
      </div>

      {/* Merit Display & Customize Button */}
      <div className="relative z-50 mt-4 flex w-full flex-col items-end gap-2 px-4 md:absolute md:top-12 md:right-4 md:mt-0 md:w-auto md:px-0">
        <div className="relative flex items-center gap-2">
          {showNewFeatureTooltip && (
            <div className="absolute right-full mr-3 w-40 animate-pulse rounded-lg bg-[#c16900] p-2 text-center text-xs font-bold text-white shadow-lg after:absolute after:top-1/2 after:-right-1 after:-mt-1 after:border-4 after:border-transparent after:border-l-[#c16900]">
              Chức năng mới vừa mở, trải nghiệm ngay!
            </div>
          )}
          <div className="relative">
            <span className="absolute -inset-1 animate-ping rounded-full bg-[#c16900]/60 opacity-75 duration-1000"></span>
            <button
              onClick={() => {
                setShowHelp(true);
                setShowNewFeatureTooltip(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#c16900] text-xl font-bold text-white shadow hover:bg-[#a05000]"
              title="Hướng dẫn"
            >
              ?
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow backdrop-blur-sm">
            <span className="text-base font-bold text-[#7b3f00]">Công đức: {merit}</span>
          </div>
        </div>
        <button
          onClick={() => setShowInventory(true)}
          className="rounded-full bg-[#d9a05d] px-3 py-1 text-xs font-bold text-white shadow-md transition hover:bg-[#c16900]"
        >
          Tùy chỉnh
        </button>
      </div>

      <PetalLayer petals={petals} active={showOffering} variant="page" />
      <PassLayer passes={passBadges} active={showOffering} variant="page" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16">

        <div className="altar-scene w-[170px] md:w-[230px] lg:w-[280px] relative">
          {/* Altar */}
          <Image
            src={ITEMS.find(i => i.id === equippedItems.altar)?.src || "/bantho.png"}
            alt="Bàn thờ"
            width={720}
            height={520}
            priority
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 190px, (max-width: 1024px) 260px, 320px"
            style={{ height: "auto" }}
          />

          {/* Incense */}
          <Image
            src={ITEMS.find(i => i.id === equippedItems.incense)?.src || "/bonhang.png"}
            alt="Bó nhang"
            width={80}
            height={260}
            className={`incense-bundle ${showOffering ? "active" : ""}`}
            priority
            sizes="80px"
          />

          <div className={`smoke-plume ${showOffering ? "active" : ""}`}>
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className={`smoke-thread thread-${index + 1}`} />
            ))}
          </div>
          <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.35em] text-[#c96a00] whitespace-nowrap">
            FPTPRAY BY VYYKA
          </p>
        </div>

        <div className="orange-divider" />

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-xl flex-col gap-4 text-[#7b3f00]"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#7b3f00]">Ngành học:</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="h-12 rounded border border-[#d9a05d] bg-white px-4 text-base outline-none focus:border-[#c16900]"
            >
              {MAJORS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Mail của bạn..."
            required
            className="h-12 rounded border border-[#d9a05d] px-4 text-base outline-none focus:border-[#c16900]"
          />

          <textarea
            name="wish"
            value={wish}
            onChange={(event) => setWish(event.target.value)}
            placeholder="Mong muốn của bạn..."
            required
            minLength={5}
            maxLength={1200}
            className="h-36 resize-none rounded border border-[#d9a05d] px-4 py-3 text-base outline-none focus:border-[#c16900]"
          />

          <div
            className={`pray-button-wrapper mt-1 ${lastWish ? "active passed" : ""
              }`}
          >
            <button
              type="submit"
              disabled={status === "sending"}
              className={`pray-button h-12 w-full rounded px-6 text-base text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${lastWish ? "pray-button-pass pray-button-tooltip" : "pray-button-default"
                }`}
            >
              <span
                className={lastWish ? "passed-label" : undefined}
                data-tooltip="Điều quan trọng phải nói 3 lần"
              >
                {lastWish
                  ? "~~~ PASSED ~~~ PASSED ~~~ PASSED ~~~"
                  : status === "sending"
                    ? "Đang thắp hương..."
                    : "Thắp hương"}
              </span>
            </button>
          </div>

          <p
            className={`wish-feedback ${lastWish ? "visible" : ""}`}
            aria-live="polite"
            role="status"
          >
            <span className="wish-feedback-text">{feedback}</span>
          </p>
        </form>

        <Leaderboard />

      </div>
      {alertState && (
        <AlertModal
          message={alertState.message}
          type={alertState.type}
          title={alertState.title}
          onClose={closeAlert}
        />
      )}
      {showInventory && (
        <InventoryModal
          merit={merit}
          equippedItems={equippedItems}
          onEquip={handleEquip}
          onClose={() => setShowInventory(false)}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </main>
  );
}

function Leaderboard() {
  const [data, setData] = useState<{ major: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const gasEndpoint = process.env.NEXT_PUBLIC_GAS_WEBAPP_URL;
      if (!gasEndpoint) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${gasEndpoint}?action=getLeaderboard`);
        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result)) {
            setData(result);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (!process.env.NEXT_PUBLIC_GAS_WEBAPP_URL) return null;

  return (
    <div className="w-full max-w-xl rounded-xl border border-[#d9a05d] bg-white/90 p-6 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 text-center text-xl font-bold uppercase text-[#7b3f00]">
        🏆 Bảng Vàng Hương Hỏa 🏆
      </h3>

      {loading ? (
        <div className="text-center text-sm text-gray-500">Đang tải...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-sm text-gray-500">Chưa có dữ liệu tháng này.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.slice(0, 5).map((item, index) => (
            <div
              key={item.major}
              className="flex items-center justify-between rounded bg-[#fff8f0] px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${index === 0
                    ? "bg-[#FFD700]"
                    : index === 1
                      ? "bg-[#C0C0C0]"
                      : index === 2
                        ? "bg-[#CD7F32]"
                        : "bg-[#d9a05d]"
                    }`}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-[#7b3f00]">{item.major}</span>
              </div>
              <span className="font-bold text-[#c16900]">{item.count} 🙏</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-center text-xs italic text-gray-400">
        *Bảng xếp hạng cập nhật theo tháng
      </p>
    </div>
  );
}

function InventoryModal({
  merit,
  equippedItems,
  onEquip,
  onClose,
}: {
  merit: number;
  equippedItems: { altar: string; incense: string };
  onEquip: (item: Item) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ItemType>("altar");

  const tabs: { id: ItemType; label: string }[] = [
    { id: "altar", label: "Bàn thờ" },
    { id: "incense", label: "Nhang" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#7b3f00]">Kho đồ tâm linh</h3>
          <button onClick={onClose} className="text-2xl text-[#7b3f00]">
            &times;
          </button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-[#d9a05d] pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-3 py-1 text-sm font-medium transition ${activeTab === tab.id
                ? "bg-[#7b3f00] text-white"
                : "text-[#7b3f00] hover:bg-[#f5e6d3]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {ITEMS.filter((item) => item.type === activeTab).map((item) => {
            const isLocked = merit < item.unlockMerit;
            const isEquipped = equippedItems[item.type] === item.id;

            return (
              <div
                key={item.id}
                onClick={() => !isLocked && onEquip(item)}
                className={`relative flex cursor-pointer flex-col items-center rounded-lg border p-2 transition ${isEquipped
                  ? "border-[#c16900] bg-[#fff8f0] ring-2 ring-[#c16900]"
                  : "border-gray-200 hover:border-[#d9a05d]"
                  } ${isLocked ? "opacity-60 grayscale" : ""}`}
              >
                <div className="relative h-20 w-full">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="mt-2 text-center text-xs font-medium text-[#7b3f00]">
                  {item.name}
                </span>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10">
                    <span className="rounded bg-black/70 px-2 py-1 text-xs text-white">
                      Cần {item.unlockMerit} 🙏
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PetalLayer({
  petals,
  active,
  variant = "local",
}: {
  petals: PetalConfig[];
  active: boolean;
  variant?: "local" | "page";
}) {
  return (
    <div className={`petal-layer ${variant === "page" ? "page" : ""}`}>
      {petals.map((petal) => (
        <span
          key={`${variant}-${petal.id}`}
          className={`petal ${active ? "active" : ""}`}
          style={{
            left: `${petal.left}%`,
            top: "-10%",
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration + (variant === "page" ? 6 : 0)
              }s`,
            transform: `scale(${variant === "page" ? petal.scale * 1.2 : petal.scale
              })`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}

function AlertModal({
  message,
  type,
  title,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  title?: string;
  onClose: () => void;
}) {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <div
          className={`alert-icon ${type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          style={{
            width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 1rem'
          }}
        >
          {type === "success" ? "✓" : "!"}
        </div>
        <h3>{title || (type === "success" ? "Thành công" : "Kiểm tra thông tin")}</h3>
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className={type === "success" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          OK
        </button>
      </div>
    </div>
  );
}

function PassLayer({
  passes,
  active,
  variant = "local",
}: {
  passes: PassConfig[];
  active: boolean;
  variant?: "local" | "page";
}) {
  return (
    <div className={`pass-layer ${variant === "page" ? "page" : ""}`}>
      {passes.map((item) => (
        <span
          key={`${variant}-pass-${item.id}`}
          className={`pass-badge ${active ? "active" : ""}`}
          style={{
            left: `${item.left}%`,
            top: "-8%",
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#7b3f00]">Hướng dẫn tu tập</h3>
          <button onClick={onClose} className="text-2xl text-[#7b3f00]">
            &times;
          </button>
        </div>

        <div className="space-y-4 text-[#7b3f00]">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff8f0] text-xl">🙏</div>
            <div>
              <h4 className="font-bold">Tích Công Đức</h4>
              <p className="text-sm text-gray-600">Mỗi lần thắp hương thành tâm, bạn sẽ nhận được <span className="font-bold text-[#c16900]">1 điểm công đức</span>.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff8f0] text-xl">🎁</div>
            <div>
              <h4 className="font-bold">Kho Đồ Tâm Linh</h4>
              <p className="text-sm text-gray-600">Dùng công đức để mở khóa các vật phẩm xịn xò hơn (Bàn thờ Ngọc, Nhang Rồng, Nhang Sen...). Bấm nút <span className="font-bold">"Tùy chỉnh"</span> để xem.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff8f0] text-xl">🏆</div>
            <div>
              <h4 className="font-bold">Đua Top Ngành</h4>
              <p className="text-sm text-gray-600">Chọn đúng ngành học của bạn khi khấn. Ngành nào có nhiều lời nguyện nhất tháng sẽ được vinh danh trên Bảng Vàng!</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded bg-[#7b3f00] py-2 font-bold text-white hover:bg-[#5a2e00]"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
