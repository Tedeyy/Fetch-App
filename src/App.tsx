import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonSpinner,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { Analytics } from '@vercel/analytics/react';

import UserHome from './pages/user/home';
import UserBooking from './pages/user/bookings';
import UserAccount from './pages/user/account';
import Login from './pages/auth/Login';
import ProfileCompletion from './pages/user/profileCompletion';
import Policy from './pages/policy';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = async (currentSession: Session | null) => {
    if (!currentSession) {
      setProfileComplete(null);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('province, city, barangay, address, contact_number')
        .eq('id', currentSession.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        setProfileComplete(false);
      } else if (data) {
        const isComplete = Boolean(
          data.province && data.city && data.barangay && data.address && data.contact_number
        );
        setProfileComplete(isComplete);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setLoading(true);
        checkProfile(currentSession);
      } else {
        setProfileComplete(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <IonApp>
        <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonApp>
    );
  }

  const showTabs = session && profileComplete;

  return (
    <IonApp>
      <Analytics />
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/login">
              {session ? (profileComplete ? <Redirect to="/home" /> : <Redirect to="/profile-completion" />) : <Login />}
            </Route>
            
            <Route exact path="/profile-completion">
              {!session ? <Redirect to="/login" /> : (profileComplete ? <Redirect to="/home" /> : <ProfileCompletion />)}
            </Route>

            <Route exact path="/policy">
              <Policy />
            </Route>
            
            <Route exact path="/home">
              {!session ? <Redirect to="/login" /> : (!profileComplete ? <Redirect to="/profile-completion" /> : <UserHome />)}
            </Route>
            <Route exact path="/bookings">
              {!session ? <Redirect to="/login" /> : (!profileComplete ? <Redirect to="/profile-completion" /> : <UserBooking />)}
            </Route>
            <Route path="/account">
              {!session ? <Redirect to="/login" /> : (!profileComplete ? <Redirect to="/profile-completion" /> : <UserAccount />)}
            </Route>
            
            <Route exact path="/">
              <Redirect to={session ? (profileComplete ? "/home" : "/profile-completion") : "/login"} />
            </Route>
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom" style={{ display: showTabs ? 'flex' : 'none' }}>
            <IonTabButton tab="tab1" href="/home">
              <IonIcon aria-hidden="true" icon={triangle} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="booking" href="/bookings">
              <IonIcon aria-hidden="true" icon={ellipse} />
              <IonLabel>Bookings</IonLabel>
            </IonTabButton>
            <IonTabButton tab="account" href="/account">
              <IonIcon aria-hidden="true" icon={square} />
              <IonLabel>Account</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
