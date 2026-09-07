import { LoginForm } from "@/components/admin/login";
import { getSiteSettings } from "@/features/projects/queries";
export default async function Login() {
  const settings = await getSiteSettings();
  return (
    <div className="register-admin">
      <main id="main">
        <div id="screen-login" className="screen">
          <div className="login-box">
            <div className="jl-mark login-mark">JL</div>
            <h1 className="login-title">
              {settings.designerName.split(" ")[0]} /<br />
              Portfolio Admin
            </h1>
            <LoginForm />
            <p className="login-foot">
              Private studio / Authorized access only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
