import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import '../assets/css/home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to Fetch</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome to Fetch</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-text-center">
          <h1>Book a new delivery</h1>
          <IonButton expand="block" routerLink="/booking">
            Book a Delivery
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
