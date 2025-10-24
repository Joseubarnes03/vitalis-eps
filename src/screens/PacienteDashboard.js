import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Linking, Platform, StatusBar, Dimensions } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons, Feather, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  // Funciones de utilidad
  const handleSocialPress = (url) => Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url));
  const openPhone = () => Linking.openURL(Platform.OS === 'android' ? 'tel:18000123456' : 'telprompt:18000123456');
  const openEmail = () => Linking.openURL('mailto:contacto@vitaliseps.com?subject=Consulta%20Vitalis%20EPS');
  const handleLogout = () => navigation.navigate('Login');

  // Datos de servicios
  const services = [
    { icon: 'medication', name: 'Medicina General', color: '#4CAF50' },
    { icon: 'favorite', name: 'Cardiología', color: '#F44336' },
    { icon: 'child-care', name: 'Pediatría', color: '#FFC107' },
    { icon: 'visibility', name: 'Oftalmología', color: '#2196F3' },
    { icon: 'pregnant-woman', name: 'Ginecología', color: '#9C27B0' },
    { icon: 'elderly', name: 'Geriatría', color: '#607D8B' },
  ];

  // Datos de noticias
  const news = [
    { title: 'Nuevo centro médico en Bogotá', date: '15 Mayo 2023', image: require('../../assets/centromedico.png') },
    { title: 'Campamento de salud gratuita', date: '22 Junio 2023', image: require('../../assets/campa.png') },
    { title: 'Innovación en telemedicina', date: '5 Julio 2023', image: require('../../assets/tele.png') },
  ];

  return (
    <View style={styles.mainContainer}>
      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
        <View style={styles.navLeft}>
          <Image source={require('../../assets/vit.png')} style={styles.logo} />
          <Text style={styles.navTitle}>Vitalis EPS</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Banner principal */}
        <View style={styles.bannerContainer}>
          <Image source={require('../../assets/vit.png')} style={styles.bannerImage} />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Cuidando tu salud, cuidando tu vida</Text>
            <Text style={styles.bannerSubtitle}>Más de 20 años de experiencia en el sector salud</Text>
          </View>
        </View>

        {/* Botones principales destacados */}
        <View style={styles.mainActionsContainer}>
          <TouchableOpacity 
            style={[styles.mainButton, styles.primaryButton]}
            onPress={() => navigation.navigate('Solicitarcita')}
          >
            <MaterialIcons name="event-available" size={28} color="white" />
            <Text style={styles.mainButtonText}>Solicitar Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.mainButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('ResultadosMe')}
          >
            <MaterialIcons name="assignment" size={28} color="white" />
            <Text style={styles.mainButtonText}>Resultados Médicos</Text>
          </TouchableOpacity>

        </View>

        {/* Tarjetas de acceso rápido */}
        <View style={styles.quickAccessContainer}>
        
         
          <TouchableOpacity 
            style={[styles.mainButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('HistorialMedico')}
          >
            <MaterialIcons name="history" size={28} color="white" />
            <Text style={styles.mainButtonText}>Historial médico</Text>
          </TouchableOpacity>
        </View>

        {/* Servicios destacados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nuestros servicios médicos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
            {services.map((service, index) => (
              <View key={index} style={[styles.serviceCard, { borderLeftColor: service.color }]}>
                <MaterialIcons name={service.icon} size={30} color={service.color} />
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceInfo}>+50 especialistas</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Noticias y actualizaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Noticias y actualizaciones</Text>
          {news.map((item, index) => (
            <TouchableOpacity key={index} style={styles.newsCard}>
              <Image source={item.image} style={styles.newsImage} />
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsDate}>{item.date}</Text>
                <Text style={styles.newsReadMore}>Leer más →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Estadísticas */}
        <View style={[styles.section, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.sectionTitle, { color: '#0E8CA4' }]}>Vitalis en números</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>250+</Text>
              <Text style={styles.statLabel}>Médicos especialistas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500K</Text>
              <Text style={styles.statLabel}>Afiliados satisfechos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfacción usuaria</Text>
            </View>
          </View>
        </View>

        {/* Testimonios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lo que dicen nuestros afiliados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
            <View style={styles.testimonialCard}>
              <Feather name="user" size={40} color="#0E8CA4" />
              <Text style={styles.testimonialText}>"Excelente atención en mi última consulta, el médico fue muy profesional"</Text>
              <Text style={styles.testimonialAuthor}>- María G.</Text>
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
            </View>
            <View style={styles.testimonialCard}>
              <Feather name="user" size={40} color="#0E8CA4" />
              <Text style={styles.testimonialText}>"Rápido servicio de urgencias cuando más lo necesité"</Text>
              <Text style={styles.testimonialAuthor}>- Carlos M.</Text>
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
              <AntDesign name="star" size={16} color="#FFC107" />
            </View>
          </ScrollView>
        </View>

        {/* Contacto */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <View style={styles.contactContainer}>
            <View style={styles.contactInfo}>
              <TouchableOpacity style={styles.contactItem} onPress={() => {}}>
                <Ionicons name="location-sharp" size={22} color="#0E8CA4" />
                <Text style={styles.contactText}>Carrera 15 #93-75, Bogotá</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={openPhone}>
                <MaterialIcons name="phone" size={22} color="#0E8CA4" />
                <Text style={styles.contactText}>(1) 8000 123 456</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
                <MaterialIcons name="email" size={22} color="#0E8CA4" />
                <Text style={styles.contactText}>contacto@vitaliseps.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={() => handleSocialPress('https://wa.me/573001234567')}>
                <FontAwesome name="whatsapp" size={22} color="#0E8CA4" />
                <Text style={styles.contactText}>300 123 4567</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactMap}>
              <Image source={require('../../assets/ubi.png')} style={styles.mapImage} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 Vitalis EPS. Todos los derechos reservados.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Terminos')}>
            <Text style={styles.footerLink}>Términos y condiciones</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>|</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Privacidad')}>
            <Text style={styles.footerLink}>Política de privacidad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  logoutText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtitle: {
    color: 'white',
    fontSize: 16,
  },
  // Estilos para los botones principales
  mainActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainButton: {
    width: '48%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButton: {
    backgroundColor: '#0E8CA4',
  },
  secondaryButton: {
    backgroundColor: '#007AFF',
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  // Resto de estilos...
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  quickCard: {
    width: '30%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  quickCardText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E8CA4',
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  servicesScroll: {
    marginHorizontal: -5,
  },
  serviceCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    borderLeftWidth: 4,
    elevation: 1,
  },
  serviceName: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  serviceInfo: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  newsCard: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  newsImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  newsContent: {
    flex: 1,
    padding: 10,
  },
  newsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  newsDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  newsReadMore: {
    color: '#007AFF',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  testimonialsScroll: {
    marginHorizontal: -10,
  },
  testimonialCard: {
    width: width - 60,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginRight: 15,
    alignItems: 'center',
    elevation: 1,
  },
  testimonialText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 15,
    color: '#555',
  },
  testimonialAuthor: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  contactContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  contactInfo: {
    flex: 1,
    paddingRight: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    marginLeft: 10,
    color: '#333',
  },
  contactMap: {
    flex: 1,
  },
  mapImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  footerLinks: {
    flexDirection: 'row',
  },
  footerLink: {
    color: 'white',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    color: 'white',
    marginHorizontal: 10,
  },
});