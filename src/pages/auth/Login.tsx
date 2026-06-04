import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  useIonToast
} from '@ionic/react';
import { supabase } from '../../supabaseClient';
import './Login.css';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
              birthdate
            }
          }
        });
        if (error) throw error;
        present({
          message: 'Signup successful! You can now log in.',
          duration: 3000,
          color: 'success'
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      present({
        message: error.message || 'An error occurred during authentication',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-content">
        <div className="auth-container">
          <IonCard className="auth-card">
            <IonCardContent>
              <div className="auth-header">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p>{isLogin ? 'Sign in to continue' : 'Sign up to get started'}</p>
              </div>

              <form onSubmit={handleAuth}>
                {!isLogin && (
                  <>
                    <IonInput
                      className="auth-input"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onIonInput={(e: any) => setUsername(e.detail.value)}
                      required
                    />
                    <IonInput
                      className="auth-input"
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onIonInput={(e: any) => setFullName(e.detail.value)}
                      required
                    />
                    <IonInput
                      className="auth-input"
                      type="date"
                      placeholder="Birthdate"
                      value={birthdate}
                      onIonInput={(e: any) => setBirthdate(e.detail.value)}
                      required
                    />
                  </>
                )}
                <IonInput
                  className="auth-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onIonInput={(e: any) => setEmail(e.detail.value)}
                  required
                />
                <IonInput
                  className="auth-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onIonInput={(e: any) => setPassword(e.detail.value)}
                  required
                />

                <IonButton expand="block" type="submit" className="auth-button" disabled={loading}>
                  {loading ? <IonSpinner name="crescent" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                </IonButton>
              </form>

              <div className="auth-toggle">
                <IonText color="medium">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </IonText>
                <IonText 
                  color="primary" 
                  className="toggle-link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
