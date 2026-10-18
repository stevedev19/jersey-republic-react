import { useEffect, useState } from "react";
import { Settings } from "./Settings";
import "../../../css/userPage.css";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import { getImageUrl } from "../../../lib/config";
import { MemberUpdateInput } from "../../../lib/types/member";

function formatMemberSince(createdAt: Date | string | undefined, language: string): string {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString(language === "ko" ? "ko-KR" : "en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function UserPage() {
  const history = useHistory();
  const { authMember } = useGlobals();
  const { t, i18n } = useTranslation();

  const [memberUpdateInput, setMemberUpdateInput] =
    useState<MemberUpdateInput>({});
  const [memberImage, setMemberImage] = useState<string>(
    "/icons/default-user.svg"
  );

  useEffect(() => {
    if (!authMember) return;
    setMemberUpdateInput({
      memberNick: authMember.memberNick ?? "",
      memberPhone: authMember.memberPhone ?? "",
      memberAddress: authMember.memberAddress ?? "",
      memberDesc: authMember.memberDesc ?? "",
      memberImage: authMember.memberImage,
    });
    setMemberImage(
      authMember.memberImage
        ? getImageUrl(authMember.memberImage)
        : "/icons/default-user.svg"
    );
  }, [authMember]);

  if (!authMember) {
    history.push("/");
    return null;
  }

  const previewName =
    memberUpdateInput.memberNick?.trim() ||
    authMember.memberNick ||
    t("profile.yourName");
  const previewLocation =
    memberUpdateInput.memberAddress?.trim() ||
    authMember.memberAddress ||
    t("profile.noLocation");
  const previewBio =
    memberUpdateInput.memberDesc?.trim() || authMember.memberDesc || "";
  const sinceLine = formatMemberSince(authMember.createdAt, i18n.language);

  return (
    <div className="member-page stitch-navbar-offset">
      <div className="member-page__inner">
        <div className="member-page__form-col">
          <header className="member-page__header">
            <h1 className="member-page__title">{t("profile.title")}</h1>
            <p className="member-page__subtitle">
              {t("profile.subtitle")}
            </p>
          </header>
          <Settings
            memberUpdateInput={memberUpdateInput}
            setMemberUpdateInput={setMemberUpdateInput}
            memberImage={memberImage}
            setMemberImage={setMemberImage}
          />
        </div>

        <div className="member-page__preview-col">
          <p className="member-page__preview-label">{t("profile.livePreview")}</p>
          <div className="member-page__preview-card">
            <img
              src={memberImage}
              alt=""
              className="member-page__preview-avatar"
            />
            <p className="member-page__preview-name">{previewName}</p>
            <span className="member-page__role-badge">
              {authMember.memberType}
            </span>
            <p className="member-page__preview-location">{previewLocation}</p>
            <ul className="member-page__social-dots" aria-hidden="true">
              <li className="member-page__social-dot" />
              <li className="member-page__social-dot" />
              <li className="member-page__social-dot" />
              <li className="member-page__social-dot" />
            </ul>
            <p className="member-page__preview-bio">
              {previewBio || t("profile.noBio")}
            </p>
            {sinceLine ? (
              <p className="member-page__since">{t("profile.memberSince", { date: sinceLine })}</p>
            ) : (
              <p className="member-page__since">{t("profile.memberSinceUnknown")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
