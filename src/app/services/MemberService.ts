import axios from "axios";
import { serverApi } from "../../lib/config";
import { clearAuthSession, getAccessToken } from "../../lib/authSession";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../../lib/types/member";

class MemberService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getTopUsers(): Promise<Member[]> {
    try {
      const url = this.path + "member/top-users";
      const result = await axios.get(url);
      return Array.isArray(result.data) ? result.data : [];
    } catch (err) {
      console.log("Error getTopUsers", err);
      throw err;
    }
  }

  public async getRestaurant(): Promise<Member> {
    try {
      const url = this.path + "member/restaurant";
      const result = await axios.get(url);
      return (result.data && typeof result.data === "object"
        ? result.data
        : ({} as Member));
    } catch (err) {
      console.log("Error getRestaurant", err);
      throw err;
    }
  }

  public async signup(input: MemberInput): Promise<Member> {
    try {
      const url = this.path + "member/signup";
      const result = await axios.post(url, input, { withCredentials: true });

      const member: Member = result.data.member;
      const token: string = result.data.accessToken;
      localStorage.setItem("memberData", JSON.stringify(member));
      if (token) localStorage.setItem("accessToken", token);
      return member;
    } catch (err) {
      console.log("Error signup", err);
      throw err;
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    try {
      const url = this.path + "member/login";
      const result = await axios.post(url, input, { withCredentials: true });

      const member: Member = result.data.member;
      const token: string = result.data.accessToken;
      localStorage.setItem("memberData", JSON.stringify(member));
      if (token) localStorage.setItem("accessToken", token);
      return member;
    } catch (err) {
      console.log("Error login", err);
      throw err;
    }
  }

  /**
   * Server logout is best-effort: an expired token or a cross-site cookie that
   * isn't sent makes the API answer 401, but the local session must still end.
   */
  public async logout(): Promise<void> {
    try {
      const url = this.path + "member/logout";
      const token = getAccessToken();
      await axios.post(url, {}, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.log("Error logout (local session cleared anyway)", err);
    } finally {
      clearAuthSession();
    }
  }

  public async updateMember(input: MemberUpdateInput): Promise<Member> {
    try {
      const formData = new FormData();
      formData.append("memberNick", input.memberNick || "");
      formData.append("memberPhone", input.memberPhone || "");
      formData.append("memberAddress", input.memberAddress || "");
      formData.append("memberDesc", input.memberDesc || "");
      formData.append("memberImage", input.memberImage || "");

      const result = await axios(`${serverApi}member/update`, {
        method: "POST",
        data: formData,
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("WWWWWWWWWW", result);

      const member: Member = result.data;
      localStorage.setItem("memberData", JSON.stringify(member));
      return member;
    } catch (err) {
      console.log("Error updateMember", err);
      throw err;
    }
  }
}

export default MemberService;
