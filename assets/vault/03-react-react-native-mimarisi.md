---
title: "React / React Native Mimarisi"
type: concept
source: mobile-app-engineering.md
---

# 3. React / React Native Mimarisi

## 3.1 React'in temel problemi

React component'leri state ve props değiştikçe yeniden render edebilir.

Önemli soru:

> Hangi component neden render oldu?

Bunu anlamak performans optimizasyonunun temelidir.

---

## 3.2 JS Thread / UI Thread

React Native uygulamasında JavaScript kodu ile native/UI tarafı farklı sorumluluklara sahiptir.

JS tarafında:

- business logic
- state
- event handling
- network işlemleri

gibi işler bulunabilir.

UI tarafı ise ekranın çizilmesi ve native interaction'larla ilgilidir.

Ağır JS işleri kullanıcı etkileşimini geciktirebilir.

---

## 3.3 JSI

JSI, JavaScript ile native C++/native dünyasının daha doğrudan iletişim kurabilmesini sağlayan altyapılardan biridir.

React Native'in modern mimarisinin önemli parçalarındandır.

---

## 3.4 Fabric

React Native'in modern rendering architecture'ıdır.

UI rendering tarafında daha modern ve performans odaklı bir altyapı sağlar.

---

## 3.5 TurboModules

Native module'lerin modern React Native architecture içindeki yaklaşımıdır.

Örneğin bir native capability'yi JavaScript tarafından kullanmak istediğinde native module sistemi devreye girebilir.

---

## 3.6 Hermes

React Native için kullanılan JavaScript engine'lerinden biridir.

Amaçlar arasında:

- startup performance
- memory efficiency
- React Native entegrasyonu

bulunur.

---
