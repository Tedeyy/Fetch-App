import { IonContent, IonPage, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import '../../assets/css/home.css';
import Map from '../../components/Map';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Map />
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            zIndex: 1000
          }}>
            <IonCard style={{ margin: 0, borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              <IonCardHeader className="ion-text-center" style={{ paddingBottom: '10px' }}>
                <IonCardTitle style={{ fontSize: '1.3rem', fontWeight: '700' }}>Ready for a ride?</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p className="ion-text-center" style={{ marginBottom: '16px', color: '#666' }}>
                  Get to your destination quickly and safely.
                </p>
                <IonButton expand="block" routerLink="/booking" shape="round" style={{ height: '50px', fontSize: '1.1rem' }}>
                  Book a Ride
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
