import { useGlobals } from "../../hooks/useGlobals";
import { MemberUpdateInput } from "../../../lib/types/member";
import { T } from "../../../lib/types/common";
import {
  sweetErrorHandling,
  sweetTopSmallSuccessAlert,
} from "../../../lib/sweetAlert";
import { Messages, getImageUrl } from "../../../lib/config";
import MemberService from "../../services/MemberService";

interface SettingsProps {
  memberUpdateInput: MemberUpdateInput;
  setMemberUpdateInput: React.Dispatch<
    React.SetStateAction<MemberUpdateInput>
  >;
  memberImage: string;
  setMemberImage: (url: string) => void;
}

export function Settings({
  memberUpdateInput,
  setMemberUpdateInput,
  memberImage,
  setMemberImage,
}: SettingsProps) {
  const { authMember, setAuthMember } = useGlobals();

  const memberNickHandler = (e: T) => {
    const v = e.target.value;
    setMemberUpdateInput((prev) => ({ ...prev, memberNick: v }));
  };

  const memberPhoneHandler = (e: T) => {
    const v = e.target.value;
    setMemberUpdateInput((prev) => ({ ...prev, memberPhone: v }));
  };

  const memberAddressHandler = (e: T) => {
    const v = e.target.value;
    setMemberUpdateInput((prev) => ({ ...prev, memberAddress: v }));
  };

  const memberDescHandler = (e: T) => {
    const v = e.target.value;
    setMemberUpdateInput((prev) => ({ ...prev, memberDesc: v }));
  };

  const handleSubmitButton = async () => {
    try {
      if (!authMember) throw new Error(Messages.error2);

      if (
        memberUpdateInput.memberNick === "" ||
        memberUpdateInput.memberPhone === "" ||
        memberUpdateInput.memberAddress === "" ||
        memberUpdateInput.memberDesc === ""
      ) {
        throw new Error(Messages.error3);
      }

      const member = new MemberService();
      const result = await member.updateMember(memberUpdateInput);
      setAuthMember(result);

      if (result.memberImage) {
        setMemberImage(getImageUrl(result.memberImage));
        setMemberUpdateInput((prev) => ({
          ...prev,
          memberImage: result.memberImage,
        }));
      }

      await sweetTopSmallSuccessAlert("Modified successfully!", 700);
    } catch (err) {
      console.log(err);
      sweetErrorHandling(err).then();
    }
  };

  const handleImageViewer = (e: T) => {
    const file = e.target.files?.[0];
    const fileType = file?.type;
    const validateImageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (!file || !fileType) return;

    if (!validateImageTypes.includes(fileType)) {
      sweetErrorHandling(Messages.error5).then();
      return;
    }

    setMemberUpdateInput((prev) => ({ ...prev, memberImage: file }));
    setMemberImage(URL.createObjectURL(file));
  };

  return (
    <div className="member-page-form">
      <div className="member-page-form__avatar-block">
        <div className="member-page-form__avatar-wrap">
          <img src={memberImage} alt="" />
        </div>
        <label className="member-page-form__upload">
          CHANGE PHOTO
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleImageViewer}
          />
        </label>
        <p className="member-page-form__hint">
          JPG, JPEG, PNG formats only!
        </p>
      </div>

      <div className="member-page-form__field">
        <label className="member-page-form__label" htmlFor="member-display-name">
          Display Name
        </label>
        <input
          id="member-display-name"
          className="member-page-form__input"
          type="text"
          placeholder={authMember?.memberNick}
          value={memberUpdateInput.memberNick ?? ""}
          name="memberNick"
          onChange={memberNickHandler}
          autoComplete="username"
        />
      </div>

      <div className="member-page-form__row">
        <div className="member-page-form__field member-page-form__field--half">
          <label className="member-page-form__label" htmlFor="member-phone">
            Phone
          </label>
          <input
            id="member-phone"
            className="member-page-form__input"
            type="text"
            placeholder={
              authMember?.memberPhone ? authMember.memberPhone : "No phone"
            }
            value={memberUpdateInput.memberPhone ?? ""}
            name="memberPhone"
            onChange={memberPhoneHandler}
            autoComplete="tel"
          />
        </div>
        <div className="member-page-form__field member-page-form__field--half">
          <label
            className="member-page-form__label"
            htmlFor="member-location"
          >
            Location
          </label>
          <input
            id="member-location"
            className="member-page-form__input"
            type="text"
            placeholder={
              authMember?.memberAddress
                ? authMember.memberAddress
                : "No address"
            }
            value={memberUpdateInput.memberAddress ?? ""}
            name="memberAddress"
            onChange={memberAddressHandler}
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="member-page-form__field">
        <label className="member-page-form__label" htmlFor="member-bio">
          Bio
        </label>
        <textarea
          id="member-bio"
          className="member-page-form__textarea"
          placeholder={
            authMember?.memberDesc ? authMember.memberDesc : "No description"
          }
          value={memberUpdateInput.memberDesc ?? ""}
          name="memberDesc"
          onChange={memberDescHandler}
        />
      </div>

      <div className="member-page-form__actions">
        <button
          type="button"
          className="member-page-form__save"
          onClick={handleSubmitButton}
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
}
