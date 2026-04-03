import { useEffect, useState } from "react";
import { Settings } from "./Settings";
import "../../../css/userPage.css";
import { useHistory } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import { getImageUrl } from "../../../lib/config";
import { MemberUpdateInput } from "../../../lib/types/member";

function formatMemberSince(createdAt: Date | string | undefined): string {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
}

export default function UserPage() {
  const history = useHistory();
  const { authMember } = useGlobals();

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
    "Your name";
  const previewLocation =
    memberUpdateInput.memberAddress?.trim() ||
    authMember.memberAddress ||
    "No location";
  const previewBio =
    memberUpdateInput.memberDesc?.trim() || authMember.memberDesc || "";
  const sinceLine = formatMemberSince(authMember.createdAt);

  return (
    <div className="member-page stitch-navbar-offset">
      <div className="member-page__inner">
        <div className="member-page__form-col">
          <header className="member-page__header">
            <h1 className="member-page__title">MY PROFILE</h1>
            <p className="member-page__subtitle">
              Manage your Republic identity
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
          <p className="member-page__preview-label">LIVE PREVIEW</p>
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
              {previewBio || "No bio yet."}
            </p>
            {sinceLine ? (
              <p className="member-page__since">MEMBER SINCE {sinceLine}</p>
            ) : (
              <p className="member-page__since">MEMBER SINCE</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
