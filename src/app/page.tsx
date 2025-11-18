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

export default function Home() {
  const [email, setEmail] = useState("");
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastWish, setLastWish] = useState<{ email: string; wish: string } | null>(null);
  const [showOffering, setShowOffering] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [heroText, setHeroText] = useState("");
  const openAlert = useCallback((message: string) => {
    setAlertMessage(message);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertMessage(null);
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
          }),
        });
      } else {
        const response = await fetch("/api/prayers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            wish: normalizedWish,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(
            data?.message ?? "Không thể gửi lời nguyện. Thử lại nhé!",
          );
        }
      }

      setStatus("success");
      setFeedback(`Mong ước ${normalizedWish} của ${normalizedEmail} đã được gửi!`);
      setLastWish({ email: normalizedEmail, wish: normalizedWish });
      triggerEffects();
      setEmail("");
      setWish("");
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
      <PetalLayer petals={petals} active={showOffering} variant="page" />
      <PassLayer passes={passBadges} active={showOffering} variant="page" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16">

        <div className="altar-scene w-[170px] md:w-[230px] lg:w-[280px]">
          <Image
            src="/bantho.png"
            alt="Bàn thờ FPT University"
            width={720}
            height={520}
            priority
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 190px, (max-width: 1024px) 260px, 320px"
            style={{ height: "auto" }}
          />

          <Image
            src="/bonhang.png"
            alt="Bó nhang"
            width={60}
            height={220}
            className={`incense-bundle ${showOffering ? "active" : ""}`}
            priority
            style={{
              height: showOffering ? "170px" : "80px",
              transition: "height 1.8s ease",
            }}
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
            className={`pray-button-wrapper mt-1 ${
              lastWish ? "active passed" : ""
            }`}
          >
            <button
              type="submit"
              disabled={status === "sending"}
              className={`pray-button h-12 w-full rounded px-6 text-base text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                lastWish ? "pray-button-pass pray-button-tooltip" : "pray-button-default"
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

      </div>
      {alertMessage && <AlertModal message={alertMessage} onClose={closeAlert} />}
    </main>
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
            animationDuration: `${
              petal.duration + (variant === "page" ? 6 : 0)
            }s`,
            transform: `scale(${
              variant === "page" ? petal.scale * 1.2 : petal.scale
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
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <div className="alert-icon">!</div>
        <h3>Kiểm tra thông tin</h3>
        <p>{message}</p>
        <button type="button" onClick={onClose}>
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
