import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from "../utils/theme";
import { Linking } from 'react-native';

// Dummy data for products
const promotedProducts = [
  { name: 'Protein Shake', description: 'High-quality protein for muscle gain.', price: '$29.99', link: 'https://www.walmart.com/ip/Premier-Protein-Shake-Chocolate-Peanut-Butter-30g-Protein-11-fl-oz-12-Ct/879392715?wmlspartner=wlpa&selectedSellerId=0&selectedOfferId=839157F10F3436CF963BDD8CECBDF862&conditionGroupCode=1&wl13=4577&gclsrc=aw.ds&adid=22222222277879392715_161193766053_21214199653&wl0=&wl1=g&wl2=c&wl3=697173827980&wl4=pla-2348450966064&wl5=9025504&wl6=&wl7=&wl8=&wl9=pla&wl10=8175035&wl11=local&wl12=879392715&veh=sem_LIA&gad_source=1&gclid=Cj0KCQjwhYS_BhD2ARIsAJTMMQbOtu1UuHsyVdpX86UMDU0spqMohAUZ8988mrGLKSoLwXgky6bIMVgaAkVjEALw_wcB', image: 'https://i5.walmartimages.com/seo/Premier-Protein-Shake-Chocolate-Peanut-Butter-30g-Protein-11-fl-oz-12-Ct_46b260a2-b6bb-4426-8d1c-3430f6bdb5a8.6bf61d7a8b276baf6f81718faff2069d.jpeg?odnHeight=117&odnWidth=117&odnBg=FFFFFF 1x,' },
  { name: 'Pre-Workout', description: 'Boost your energy before workouts.', price: '$19.99', link: 'https://www.walmart.com/ip/Cellucor-C4-Sport-Pre-Workout-Powder-Icy-Blue-Razz-20-Servings/5619220015?classType=REGULAR&adsRedirect=true', image: 'https://i5.walmartimages.com/seo/Cellucor-C4-Sport-Pre-Workout-Powder-Icy-Blue-Razz-20-Servings_9f50f111-0476-4546-92b3-5969bea13bad.5aca95069fc5d04598cc44e77253e9a1.png?odnHeight=640&odnWidth=640&odnBg=FFFFFF' }
];

const categories = {
  "Weight Loss": [
    { name: 'Metabolism Igniter', description: 'Supports weight loss and boosts metabolism.', price: '$59.99', link: 'https://www.gnc.com/stimulant-thermogenics/485500.html#srsltid=AfmBOoorsbYAZKhmb00G89VHKsTFwAM2rpT4TtuJyOERmw5_YYw8xHdS&start=1', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw8267fa0f/hi-res/485500_BodyDynamix_Slimvance_XP_Carton_Front.jpg?sw=1500&sh=1500&sm=fit' },
    { name: 'Lean Shake', description: 'Natural fat-burning supplement.', price: '$34.99', link: 'https://www.gnc.com/ready-to-drink-protein/333005.html#start=1', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw5b6490f0/hi-res/333005_GNC_Total_Lean_Lean_Shake_25_Swiss_Chocolate_Case_Front.jpg?sw=480&sh=480&sm=fit' }
  ],
  "Muscle Gain": [
    { name: 'Creatine', description: 'Improves strength and muscle mass.', price: '$44.99', link: 'https://www.gnc.com/creatine/759017.html#start=1', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw4b4bacc6/hi-res/759017_GNC_PRO_Performance_Creatine_Monohydrate_100svg_tub_Front.png?sw=1500&sh=1500&sm=fit' },
    { name: 'Bulk 1340', description: 'Calorie-dense supplement for muscle gain.', price: '$81.99', link: 'https://www.gnc.com/mass-gainers/414803.html#start=1', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dwd0c61ffd/hi-res/414803_GNC_Pro_Performace_Bulk_1340_Double_Chocolate_15srv_bag_Front.jpg?sw=1500&sh=1500&sm=fit' }
  ],
  "Supplements": [
    { name: 'Multivitamin', description: 'Essential vitamins and minerals for overall health.', price: '$45.99', link: 'https://www.gnc.com/multivitamins-for-men/206322.html#start=1', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dwb20d576e/hi-res/GNC-69511/206322_GNC_Mega_Men_50_Plus_Multi_120ct_Box_Front.png?sw=1500&sh=1500&sm=fit' },
    { name: 'Omega-3 Fish Oil', description: 'Supports heart health and brain function.', price: '$12.99', link: 'https://www.naturemade.com/products/omega-3-from-fish-oil-and-algae-oil-softgels?queryID=c87f0288afd6b071e4ae47e35582f590&s=1&p=1&variant=43009043366027&utm_campaign=dtcpmaxinnovation&utm_source=google&gad_source=1&gclid=Cj0KCQjwhYS_BhD2ARIsAJTMMQaeLbYV9lIcGEEM0sxKGY9atT6YF8YMt2lfJ8aHYCRXx3zOF13RG5oaAl1ZEALw_wcB&gclsrc=aw.ds', image: 'https://www.naturemade.com/cdn/shop/files/NMHL000592PK002164FISH_ALGAEOIL_5A007225ccfrontnf_288x.png?v=1736790617 288w' }
  ],
  "Protein": [  
    { name: 'Whey Protein', description: 'Fast-absorbing protein for muscle recovery.', price: '$29.99', link: 'https://www.gnc.com/whey-protein/350258.html?ogmap=SHP%7CNBR%7CGOOG%7CSTND%7Cc%7CSITEWIDE%7CPROTEINT%7C%7BG_PMax_NB_Protein_Top%7D%7C%7Badgroup%7D%7C%7C21161626264%7C&gad_source=1&gclid=Cj0KCQjwhYS_BhD2ARIsAJTMMQaaq_AdqpLReysYbCKyCG3GAoi0e6SlTK7TnyHzzYxzhaqdQriVxPcaApN_EALw_wcB&gclsrc=aw.ds', image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-master-catalog-gnc/default/dw95d7deeb/hi-res/350258_web_Optimum%20Nutrition%20GSW_5LB_ExtMilkChocolate_Front_.jpg?sw=1500&sh=1500&sm=fit' },
    { name: 'Plant-Based Protein', description: 'Vegan protein source for muscle growth.', price: '$24.99', link: 'https://example.com', image: 'https://i5.walmartimages.com/seo/Orgain-Organic-Vegan-21g-Protein-Powder-Plant-Based-Shake-Drink-Creamy-Chocolate-Fudge-1-02lb_88ae16f8-1516-470a-a0cd-06e6c475cd6e.7062e2a9db4d480e37cb8c1cc640546a.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF' }
  ],
  "Gut Health": [
    { name: 'Probiotics', description: 'Supports digestive health and immunity.', price: '$17.99', link: 'https://example.com', image: 'https://i5.walmartimages.com/seo/Physician-s-Choice-60-Billion-Probiotic-for-Women-and-Men-30-Count-Digestive-Gut-Health_de36ae58-b8fc-4c0e-ac71-b958a7613035.ab90ac985a10f599b64330f93dd956e0.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF' },
    { name: 'Fiber Supplement', description: 'Promotes healthy digestion and regularity.', price: '$11.99', link: 'https://example.com', image: 'https://i5.walmartimages.com/seo/Metamucil-Fiber-Supplement-No-Sugar-Added-Fiber-Gummies-for-Daily-Digestive-Health-Orange-72-Count_7e92bb7b-d93d-4a9a-b030-5d800f807884.8957fb23b5bf54944addd3b086e883d1.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF' }
  ],
  "Joint Support": [
    { name: 'Glucosamine', description: 'Supports joint health and flexibility.', price: '$15.99', link: 'https://example.com', image: 'https://i5.walmartimages.com/seo/2-Pack-Triple-Strength-Glucosamine-Chondroitin-Collagen-Msm-Support-Joint-Strength-120-Capsules_fe815be6-7b68-437e-b9b9-5366a7de4888.6b0fd490cde0e3b198081cff55907118.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF' },
    { name: 'Turmeric Curcumin', description: 'Anti-inflammatory for joint pain relief.', price: '$21.99', link: 'https://example.com', image: 'https://i5.walmartimages.com/seo/Best-Naturals-Turmeric-Curcumin-1500mg-Serving-with-Bioperine-180-Veggie-Capsules_a050114e-1ceb-4fdd-8505-6ad56d3298e9.7ab733a2861be4ef82b503ee456005db.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF' }
  ]
};

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('Weight Loss');

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => Linking.openURL(item.link)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productTitle}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <Text style={styles.productDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: theme.spacing.medium, paddingTop: 0 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Shop</Text>

            {/* Promoted Products */}
            <Text style={styles.sectionTitle}>Promoted Products</Text>
            <FlatList
              data={promotedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => `promoted-${index}`}
              numColumns={2}
              columnWrapperStyle={styles.rowSpacing}
            />

            {/* Category Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tabScrollContainer}
            >
              {Object.keys(categories).map((category) => (
                <TouchableOpacity key={category} onPress={() => setSelectedCategory(category)} style={styles.tabButton}>
                  <Text style={styles.tabText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </>
        }
        data={categories[selectedCategory]}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `product-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.rowSpacing}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.medium,
  },
  scrollContainer: {
    padding: theme.spacing.medium,
  },
  header: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  promotedList: {
    paddingVertical: theme.spacing.small,
  },
  productCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    margin: theme.spacing.small,
    alignItems: 'center',
    width: '45%',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
  },
  productTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  productPrice: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.medium,
    marginVertical: theme.spacing.small,
  },
  productDescription: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabScrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.small,
  },
  tabButton: {
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
  },
  tabText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  productsGrid: {
    paddingBottom: theme.spacing.medium,
  },
});

export default Shop;
