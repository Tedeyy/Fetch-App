import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const Policy: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile-completion" />
          </IonButtons>
          <IonTitle>Privacy Policy & Terms</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Terms of Usage and Privacy Policy</h2>
        <p>
          Welcome to our app. By using our services, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this application.
        </p>
        <h3>1. Terms</h3>
        <p>
          By accessing this application, you are agreeing to be bound by these Terms of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
        </p>
        <h3>2. Privacy Policy</h3>
        <p>
          Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our application. We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
        </p>
        <h3>3. Data Usage</h3>
        <p>
          The data you provide, including your address and contact number, will be used solely for the purpose of delivering the services requested and improving user experience. We do not share your personal information with third parties except as required by law.
        </p>
        <p>
          <i>This is a generic placeholder policy and will be updated in the future.</i>
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Policy;
