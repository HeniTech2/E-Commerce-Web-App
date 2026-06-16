import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineLogout } from "react-icons/hi";
import { ShopContext } from "../context/ShopContext";
import { api, updateProfile, changePassword } from "../api";

const Profile = () => {
  const { token, userId, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const inputClass = "w-full border border-border bg-paper2 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    api("/api/user/profile/get", { method: "POST", body: JSON.stringify({ userId }) })
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setProfileForm({ name: data.user.name, email: data.user.email });
        }
      });
  }, [token, userId, navigate]);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await updateProfile(profileForm.name, profileForm.email);
      if (data.success) {
        setUser(data.user);
        toast.success("Profile updated");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Could not connect to server");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const data = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (data.success) {
        toast.success("Password changed successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch {
      toast.error("Could not connect to server");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div className="max-w-7xl mx-auto px-5 py-24 text-center text-stone">Loading…</div>;
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-ET", { year: "numeric", month: "long" });

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-12">
      <h1 className="font-display text-4xl font-bold mb-2">My profile</h1>
      <p className="text-stone text-sm mb-10">Member since {memberSince}</p>

      {/* Profile info */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primaryLight flex items-center justify-center shrink-0">
            <HiOutlineUser className="text-primary" size={26} />
          </div>
          <div>
            <p className="font-display font-bold text-lg">{user.name}</p>
            <p className="text-stone text-sm">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone mb-1.5">Full name</label>
              <input
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone mb-1.5">Email</label>
              <input
                required
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Email"
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
            <HiOutlineLockClosed className="text-stone" size={18} />
          </div>
          <div>
            <p className="font-display font-semibold">Change password</p>
            <p className="text-xs text-stone">Minimum 8 characters</p>
          </div>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <input
            required
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            placeholder="Current password"
            className={inputClass}
          />
          <input
            required
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="New password"
            className={inputClass}
          />
          <input
            required
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            placeholder="Confirm new password"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={savingPassword}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors disabled:opacity-60"
          >
            {savingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <div className="bg-white border border-border rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold">Sign out</p>
            <p className="text-xs text-stone mt-0.5">You'll need to sign back in to place orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-danger hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <HiOutlineLogout size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;