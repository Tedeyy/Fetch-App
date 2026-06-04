import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent } from '@ionic/react';
import '../../assets/css/home.css';
import Map from '../../components/Map';
import MapRouting from '../../components/Routing';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Fetch</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome to Fetch</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-text-center">
          <h1>Hey User! Going somewhere without a ride?</h1>
          <IonButton expand="block" routerLink="/booking">
            Book a Ride
          </IonButton>
        </div>
        <Map />
        <MapRouting />
      </IonContent>
    </IonPage>
  );
};

export default Home;
