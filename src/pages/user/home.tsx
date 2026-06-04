import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonModal, IonSegment, IonSegmentButton, IonLabel, IonItem, IonInput, IonIcon, IonTextarea, useIonToast, IonSpinner } from '@ionic/react';
import { locationOutline, mapOutline, cubeOutline, chatbubbleOutline } from 'ionicons/icons';
import '../../assets/css/home.css';
import Map from '../../components/Map';
import { supabase } from '../../supabaseClient';

const Home: React.FC = () => {
  const [presentToast] = useIonToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [waitingForRider, setWaitingForRider] = useState(false);
  const [activeBookingStatus, setActiveBookingStatus] = useState<string>('');

  const [serviceType, setServiceType] = useState('Pahatod');
  const [activeLocationField, setActiveLocationField] = useState<'pickup' | 'dropoff'>('pickup');

  const [pickupName, setPickupName] = useState('Fetching location...');
  const [dropoffName, setDropoffName] = useState('Unknown Location');

  const [pickupCoords, setPickupCoords] = useState<[number, number]>([8.367951, 124.865832]);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([8.368951, 124.866832]);

  const [item, setItem] = useState('');
  const [notes, setNotes] = useState('');

  // On mount: check for active bookings
  useEffect(() => {
    const checkActiveBooking = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user.id)
          .in('status', ['Waiting for Rider', 'On-going'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setServiceType(data.booking_type || 'Pahatod');
          setPickupName(data.pickup_address || '');
          setDropoffName(data.dropoff_address || '');
          if (data.pickup_latitude && data.pickup_longitude) {
            setPickupCoords([data.pickup_latitude, data.pickup_longitude]);
          }
          if (data.dropoff_latitude && data.dropoff_longitude) {
            setDropoffCoords([data.dropoff_latitude, data.dropoff_longitude]);
          }
          setActiveBookingStatus(data.status);
          setWaitingForRider(true);
        }
      } catch (err: any) {
        console.error('Error fetching active booking:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveBooking();
  }, []);

  const startBooking = () => {
    setIsBooking(true);
    setShowModal(true);
  };

  const handlePickupUpdate = (name: string, lat: number, lng: number) => {
    setPickupName(name);
    setPickupCoords([lat, lng]);
  };

  const handleDropoffUpdate = (name: string, lat: number, lng: number) => {
    setDropoffName(name);
    setDropoffCoords([lat, lng]);
  };

  const confirmBooking = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        presentToast({ message: 'Please log in to book a ride.', duration: 3000, color: 'danger' });
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert([{
          customer_id: user.id,
          booking_type: serviceType,
          status: 'Waiting for Rider',
          pickup_address: pickupName,
          pickup_latitude: pickupCoords[0],
          pickup_longitude: pickupCoords[1],
          dropoff_address: dropoffName,
          dropoff_latitude: dropoffCoords[0],
          dropoff_longitude: dropoffCoords[1],
          item_description: serviceType === 'Padala' ? item : null,
          customer_to_rider_notes: notes || null,
        }]);

      if (error) throw error;

      setShowModal(false);
      setIsBooking(false);
      setActiveBookingStatus('Waiting for Rider');
      setWaitingForRider(true);

    } catch (error: any) {
      console.error(error);
      presentToast({ message: 'Failed to create booking: ' + error.message, duration: 3000, color: 'danger' });
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <IonPage>
        <IonContent scrollY={false} fullscreen>
          <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}>
            <IonSpinner name="crescent" style={{ width: '48px', height: '48px', color: 'var(--ion-color-primary)' }} />
            <p style={{ margin: 0, color: '#555', fontSize: '1rem', fontWeight: '500' }}>
              Loading your session...
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>

          <div style={{ flex: 1, position: 'relative' }}>
            <Map
              isBlurred={!isBooking && !waitingForRider}
              isBooking={isBooking && !waitingForRider}
              activeField={activeLocationField}
              pickupCoords={pickupCoords}
              dropoffCoords={dropoffCoords}
              onPickupUpdate={handlePickupUpdate}
              onDropoffUpdate={handleDropoffUpdate}
              routePoints={waitingForRider ? { pickup: pickupCoords, dropoff: dropoffCoords } : null}
            />
          </div>

          {/* Overlay Card when idle */}
          {!isBooking && !waitingForRider && (
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
                  <IonButton expand="block" shape="round" style={{ height: '50px', fontSize: '1.1rem' }} onClick={startBooking}>
                    Book a Ride
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {/* Waiting for Rider / On-going status box */}
          {waitingForRider && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '400px',
              zIndex: 1000,
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <IonSpinner name="dots" style={{ color: 'var(--ion-color-primary)' }} />
                <h3 style={{ margin: 0, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                  {activeBookingStatus === 'On-going' ? 'Rider On The Way!' : 'Waiting for Rider...'}
                </h3>
              </div>
              <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '0.85rem' }}>
                📦 {serviceType}
              </p>
              <p style={{ margin: 0, color: '#999', fontSize: '0.8rem' }}>
                {pickupName} → {dropoffName}
              </p>
            </div>
          )}

          {/* Bottom Sheet Modal */}
          <IonModal
            isOpen={showModal}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 0.9]}
            onDidDismiss={() => {
              if (!waitingForRider) {
                setShowModal(false);
                setIsBooking(false);
              }
            }}
            backdropDismiss={false}
            backdropBreakpoint={0.5}
          >
            <IonContent className="ion-padding">
              <h2 style={{ marginTop: '0', marginBottom: '16px', fontWeight: 'bold' }}>Create Booking</h2>

              <IonSegment
                value={serviceType}
                onIonChange={e => setServiceType(e.detail.value as string)}
                style={{ marginBottom: '20px' }}
              >
                <IonSegmentButton value="Pahatod"><IonLabel>Pahatod</IonLabel></IonSegmentButton>
                <IonSegmentButton value="Padala"><IonLabel>Padala</IonLabel></IonSegmentButton>
                <IonSegmentButton value="PasaBuy"><IonLabel>PasaBuy</IonLabel></IonSegmentButton>
              </IonSegment>

              <IonItem
                className="ion-margin-bottom"
                style={{ borderRadius: '10px', border: activeLocationField === 'pickup' ? '2px solid var(--ion-color-primary)' : 'none' }}
              >
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonInput
                  label="Pickup Location" labelPlacement="floating"
                  value={pickupName} readonly
                  onFocus={() => setActiveLocationField('pickup')}
                />
              </IonItem>

              <IonItem
                className="ion-margin-bottom"
                style={{ borderRadius: '10px', border: activeLocationField === 'dropoff' ? '2px solid var(--ion-color-secondary)' : 'none' }}
              >
                <IonIcon icon={mapOutline} slot="start" color="secondary" />
                <IonInput
                  label="Dropoff Location" labelPlacement="floating"
                  placeholder="Tap here, then drag blue pin"
                  value={dropoffName} readonly
                  onFocus={() => setActiveLocationField('dropoff')}
                />
              </IonItem>

              {serviceType === 'Padala' && (
                <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                  <IonIcon icon={cubeOutline} slot="start" color="warning" />
                  <IonInput
                    label="Item Description" labelPlacement="floating"
                    placeholder="What are you sending?"
                    value={item} onIonInput={e => setItem(e.detail.value as string)}
                  />
                </IonItem>
              )}

              <IonItem className="ion-margin-bottom" style={{ borderRadius: '10px' }}>
                <IonIcon icon={chatbubbleOutline} slot="start" color="medium" />
                <IonTextarea
                  label="Notes for Rider" labelPlacement="floating"
                  placeholder="Any specific instructions?"
                  value={notes} onIonInput={e => setNotes(e.detail.value as string)}
                  autoGrow
                />
              </IonItem>

              <IonButton expand="block" shape="round" className="ion-margin-top" style={{ height: '50px' }} onClick={confirmBooking}>
                Confirm Booking
              </IonButton>
            </IonContent>
          </IonModal>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
