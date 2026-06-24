import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Platform, 
  Linking,
  ScrollView
} from 'react-native';
import { db } from '../db/client';
import { articles, bonusSettings } from '../db/schema';
import { processPurchase, getCustomer } from '../db/operations';
import { InferSelectModel } from 'drizzle-orm';

type Article = InferSelectModel<typeof articles>;

// Mock top sellers
const TOP_SELLERS: Article[] = [
  { id: -1, sku: 'TOP1', name: 'Kodak Gold 200 135-36', price: 129 },
  { id: -2, sku: 'TOP2', name: 'Ilford HP5 Plus 400 135-36', price: 109 },
  { id: -3, sku: 'TOP3', name: 'Kodak Portra 400 135-36', price: 189 },
  { id: -4, sku: 'TOP4', name: 'Kodak Tri-X 400 135-36', price: 129 },
];

export default function PosScreen() {
  const isFocused = useIsFocused();
  const [phone, setPhone] = useState('');
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [cart, setCart] = useState<Article[]>([]);
  const [customerStatus, setCustomerStatus] = useState<string | null>(null);
  const [availableBonuses, setAvailableBonuses] = useState<number>(0);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [appliedBonusesCount, setAppliedBonusesCount] = useState<number>(0);
  
  // Navigation states
  const [currentView, setCurrentView] = useState<'HOME' | 'BRAND_SELECTION' | 'ARTICLE_SELECTION'>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await db.select().from(articles);
      setAvailableArticles(data);
    };
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const subTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = Math.max(0, subTotal - (appliedBonusesCount * rewardAmount));

  const searchCustomer = async () => {
    if (!phone) {
      Alert.alert("Ange telefonnummer", "Vänligen ange ett telefonnummer att söka på först.");
      return;
    }
    try {
      const config = await db.select().from(bonusSettings).limit(1);
      const threshold = config.length > 0 ? config[0].threshold : 1000;
      const rewardAmountValue = config.length > 0 ? config[0].rewardAmount : 100;

      const customer = await getCustomer(phone);
      
      if (!customer || customer.currentBalance === 0) {
        setCustomerStatus(`Ny kund. ${threshold} kr kvar till nästa bonus.`);
        setAvailableBonuses(0);
        setAppliedBonusesCount(0);
      } else {
        const currentBalance = customer.currentBalance;
        const availableBonusesFound = Math.floor(currentBalance / threshold);
        const currentProgress = currentBalance % threshold;
        const remaining = threshold - currentProgress;

        if (availableBonusesFound > 0) {
          const totalReward = rewardAmountValue * availableBonusesFound;
          setAvailableBonuses(availableBonusesFound);
          setRewardAmount(rewardAmountValue);
          setCustomerStatus(`Kund hittad! Kunden har ${availableBonusesFound} st bonus(ar) på ${totalReward} kr att utnyttja. Dessutom är det bara ${remaining} kr kvar till nästa bonus!`);
        } else {
          setAvailableBonuses(0);
          setCustomerStatus(`Kund hittad! Den här kunden har just nu ${remaining} kr kvar till nästa bonus.`);
        }
        setAppliedBonusesCount(0);
      }
    } catch (error: any) {
      Alert.alert("Fel vid sökning", error.message);
    }
  };

  const sendSms = (number: string, amount: number, bonusEarned: boolean) => {
    let msg = `Tack för ditt köp på Kamera Stockholm! Ditt köp på ${amount} kr har registrerats.`;
    if (bonusEarned) {
      msg += ` Grattis! Du har nått en ny bonusnivå och har en belöning att hämta ut vid ditt nästa köp!`;
    }
    const url = `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    try {
      if (!phone || cart.length === 0) {
        Alert.alert("Info saknas", "Mata in telefonnummer och välj artiklar.");
        return;
      }

      const { bonusEarned } = await processPurchase(phone, total, appliedBonusesCount);

      const title = bonusEarned ? "🎉 Bonus Uppnådd! 🎉" : "Köp registrerat";
      const message = bonusEarned 
        ? "Kunden har precis nått en ny bonusnivå!\n\nVill du skicka ett bekräftelse-SMS till kunden?"
        : "Vill du skicka ett bekräftelse-SMS till kunden?";

      Alert.alert(title, message, [
        { 
          text: "Nej", 
          style: "cancel",
          onPress: () => { 
            setCart([]); 
            setPhone(''); 
            setCustomerStatus(null);
            setAvailableBonuses(0);
            setAppliedBonusesCount(0);
            setCurrentView('HOME');
          } 
        },
        { 
          text: "Ja, öppna SMS", 
          onPress: () => { 
            sendSms(phone, total, bonusEarned); 
            setCart([]); 
            setPhone(''); 
            setCustomerStatus(null);
            setAvailableBonuses(0);
            setAppliedBonusesCount(0);
            setCurrentView('HOME');
          } 
        }
      ]);
    } catch (error: any) {
      Alert.alert("Ett fel uppstod", error.message);
    }
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('BRAND_SELECTION');
  };

  const handleBrandPress = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentView('ARTICLE_SELECTION');
  };

  const categoryArticles = availableArticles.filter(item => {
    if (selectedCategory === 'Färgfilm') return item.category === 'COLOR';
    if (selectedCategory === 'Svartvit film') return item.category === 'BW';
    return true;
  });

  const uniqueBrands = Array.from(new Set(categoryArticles.map(item => item.name.split(' ')[0]))).sort();

  const brandArticles = categoryArticles.filter(item => item.name.split(' ')[0] === selectedBrand).sort((a, b) => a.name.localeCompare(b.name));

  const renderArticle = ({ item }: { item: Article }) => {
    const brand = item.name.split(' ')[0];
    return (
      <TouchableOpacity 
        style={styles.articleCard} 
        onPress={() => setCart([...cart, item])}
      >
        <View>
          <Text style={styles.articleName}>{item.name}</Text>
          {currentView === 'ARTICLE_SELECTION' && (
            <Text style={styles.articleBrand}>Märke: {brand}</Text>
          )}
        </View>
        <Text style={styles.articlePrice}>{item.price} kr</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput 
          style={styles.phoneInput} 
          placeholder="Kundens telefonnummer" 
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (customerStatus) setCustomerStatus(null);
            setAppliedBonusesCount(0);
            setAvailableBonuses(0);
          }}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchCustomer}>
          <Text style={styles.searchButtonText}>Sök Kund</Text>
        </TouchableOpacity>
      </View>

      {customerStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{customerStatus}</Text>
          
          {availableBonuses > 0 && (
            <View style={{marginTop: 10}}>
              {availableBonuses - appliedBonusesCount > 0 && (
                <TouchableOpacity 
                  style={styles.bonusButton} 
                  onPress={() => setAppliedBonusesCount(prev => prev + 1)}
                >
                  <Text style={styles.bonusButtonText}>Utnyttja 1 st bonus (-{rewardAmount} kr)</Text>
                </TouchableOpacity>
              )}
              
              {appliedBonusesCount > 0 && (
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
                  <Text style={styles.bonusAppliedText}>
                    {appliedBonusesCount} st bonusar valda (-{appliedBonusesCount * rewardAmount} kr)
                  </Text>
                  <TouchableOpacity onPress={() => setAppliedBonusesCount(0)} style={{padding: 5}}>
                    <Text style={{color: '#f37f06', textDecorationLine: 'underline', fontSize: 16}}>Nollställ/Ångra</Text>
                  </TouchableOpacity>
                </View>
              )}

              {appliedBonusesCount > 0 && availableBonuses - appliedBonusesCount > 0 && (
                <Text style={{color: '#555', marginTop: 5, fontStyle: 'italic'}}>
                  Kunden har {availableBonuses - appliedBonusesCount} bonus(ar) kvar att utnyttja.
                </Text>
              )}
              {appliedBonusesCount > 0 && availableBonuses - appliedBonusesCount === 0 && (
                <Text style={{color: '#555', marginTop: 5, fontStyle: 'italic'}}>
                  Kunden har inga fler bonusar att utnyttja på detta köp.
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.contentArea}>
        {currentView === 'HOME' ? (
          <ScrollView>
            <Text style={styles.label}>Välj artiklar:</Text>
            {TOP_SELLERS.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.articleCard} 
                onPress={() => setCart([...cart, item])}
              >
                <Text style={styles.articleName}>{item.name}</Text>
                <Text style={styles.articlePrice}>{item.price} kr</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.categoryRow}>
              <TouchableOpacity 
                style={styles.colorCategoryButton} 
                onPress={() => handleCategoryPress('Färgfilm')}
              >
                <View style={styles.colorStripes}>
                  <View style={[styles.stripe, { backgroundColor: '#4188d8' }]} />
                  <View style={[styles.stripe, { backgroundColor: '#84c952' }]} />
                  <View style={[styles.stripe, { backgroundColor: '#f6b518' }]} />
                  <View style={[styles.stripe, { backgroundColor: '#f37f06' }]} />
                  <View style={[styles.stripe, { backgroundColor: '#ee0c00' }]} />
                </View>
                <View style={styles.categoryOverlay}>
                  <Text style={styles.colorCategoryText}>COLOR</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.bwCategoryButton} 
                onPress={() => handleCategoryPress('Svartvit film')}
              >
                <View style={styles.bwStripes}>
                  <View style={[styles.stripe, { backgroundColor: '#ffffff' }]} />
                  <View style={[styles.stripe, { backgroundColor: '#000000' }]} />
                </View>
                <View style={styles.categoryOverlay}>
                  <Text style={[styles.bwCategoryText, { color: '#000', marginRight: 15 }]}>BLACK</Text>
                  <Text style={[styles.bwCategoryText, { color: '#fff', marginLeft: 15 }]}>WHITE</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : currentView === 'BRAND_SELECTION' ? (
          <View style={styles.categoryView}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity onPress={() => setCurrentView('HOME')} style={styles.backButton}>
                <Text style={styles.backButtonText}>{"< TILLBAKA (HEM)"}</Text>
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>{selectedCategory}</Text>
            </View>
            <View style={styles.brandsGrid}>
              {uniqueBrands.map((brand) => (
                <TouchableOpacity 
                  key={brand} 
                  style={styles.brandSquareButton} 
                  onPress={() => handleBrandPress(brand)}
                >
                  <Text style={styles.brandButtonText}>{brand}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.categoryView}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity onPress={() => setCurrentView('BRAND_SELECTION')} style={styles.backButton}>
                <Text style={styles.backButtonText}>{`< TILLBAKA (${selectedCategory})`}</Text>
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>{selectedBrand}</Text>
            </View>
            <FlatList 
              data={brandArticles} 
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderArticle}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalText}>Totalt: {total} kr</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleComplete}>
          <Text style={styles.checkoutButtonText}>Slutför köp & Skicka SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fafafa' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  phoneInput: { flex: 1, fontSize: 24, borderBottomWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, backgroundColor: '#fff' },
  searchButton: { backgroundColor: '#4188d8', padding: 15, borderRadius: 4, justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusContainer: { marginBottom: 20 },
  statusText: { fontSize: 16, color: '#555', fontStyle: 'italic', marginBottom: 10 },
  bonusButton: { backgroundColor: '#f37f06', padding: 10, borderRadius: 8, alignItems: 'center' },
  bonusButtonText: { color: '#fff', fontWeight: 'bold' },
  bonusAppliedText: { color: '#f37f06', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  
  contentArea: { flex: 1, marginTop: 10 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  
  articleCard: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  articleName: { fontSize: 16, color: '#333' },
  articleBrand: { fontSize: 12, color: '#666', marginTop: 4 },
  articlePrice: { fontSize: 16, fontWeight: 'bold', color: '#000' },

  categoryRow: { flexDirection: 'row', height: 80, gap: 15, marginTop: 20 },
  colorCategoryButton: { flex: 1, overflow: 'hidden' },
  bwCategoryButton: { flex: 1, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc' },
  colorStripes: { flexDirection: 'row', flex: 1 },
  bwStripes: { flexDirection: 'row', flex: 1 },
  stripe: { flex: 1 },
  categoryOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  colorCategoryText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  bwCategoryText: { fontSize: 20, fontWeight: 'bold' },

  categoryView: { flex: 1 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  backButton: { padding: 10, marginRight: 15 },
  backButtonText: { fontSize: 16, fontWeight: 'bold', color: '#4188d8' },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  brandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 20 },
  brandSquareButton: { width: 150, height: 150, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  brandButtonText: { fontSize: 22, fontWeight: 'bold', color: '#333' },

  footer: { paddingTop: 20 },
  totalText: { fontSize: 24, fontWeight: 'bold', textAlign: 'right', marginBottom: 15 },
  checkoutButton: { backgroundColor: '#84c952', padding: 20, borderRadius: 8, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});