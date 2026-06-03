import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import '../../assets/css/bookings.css';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Bookings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Bookings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Bookings page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
