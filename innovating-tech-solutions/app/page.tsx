import Link from 'next/link';
import { 
  Smartphone, 
  Monitor, 
  Camera, 
  Wrench, 
  Globe, 
  Shield,
  Phone,
  MapPin,
  ShoppingCart
} from 'lucide-react';

export default function Home() {
  const services = [
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: "Cellphone Repairs",
      description: "Screen replacements, battery changes, and all phone repairs",
      link: "/services/phone-repair"
    },
    {
      icon: <Monitor className="w-12 h-12" />,
      title: "Computer Maintenance",
      description: "Hardware upgrades, software fixes, and system optimization",
      link: "/services/computer-maintenance"
    },
    {
      icon: <Camera className="w-12 h-12" />,
      title: "CCTV Installation",
      description: "Professional security camera installation and setup",
      link: "/services/cctv-installation"
    },
    {
      icon: <Wrench className="w-12 h-12" />,
      title: "Call-Out Repairs",
      description: "We come to you! On-site repairs anywhere in Alberton",
      link: "/services/call-out"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Website Development",
      description: "Custom websites built for your business needs",
      link: "/services/web-development"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Website Security",
      description: "Protect your online presence with our security services",
      link: "/services/web-security"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Innovating Tech Solutions</h1>
              <p className="text-primary-100 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                Alberton, Gauteng
              </p>
            </div>
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="/services" className="hover:text-primary-200 transition">Services</Link>
              <Link href="/shop" className="hover:text-primary-200 transition">Shop</Link>
              <Link href="/contact" className="hover:text-primary-200 transition">Contact</Link>
              <Link href="/cart" className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Complete Tech Solution Partner
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From repairs to installations, we've got all your technology needs covered. 
            Professional service, affordable prices, and we come to you!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/services/call-out" 
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Book Call-Out Service
            </Link>
            <Link 
              href="/shop" 
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
            >
              Shop Accessories
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Link 
                key={index}
                href={service.link}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-primary-500 hover:shadow-xl transition group"
              >
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Popular Accessories</h2>
            <Link href="/shop" className="text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "LCD Screens", price: "From R299", image: "📱" },
              { name: "Charging Cables", price: "From R49", image: "🔌" },
              { name: "Screen Protectors", price: "From R79", image: "🛡️" },
              { name: "Phone Cases", price: "From R99", image: "📲" }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
                <div className="text-6xl mb-4 text-center">{product.image}</div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-primary-600 font-semibold mb-4">{product.price}</p>
                <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Need Urgent Repairs?</h2>
          <p className="text-xl mb-8 text-primary-100">
            We offer same-day call-out services in Alberton and surrounding areas
          </p>
          <Link 
            href="/contact" 
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition inline-block"
          >
            Contact Us Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Innovating Tech Solutions</h3>
              <p className="text-gray-400">
                Your trusted partner for all tech repairs and services in Alberton, Gauteng.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/shop" className="hover:text-white">Shop</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 Alberton, Gauteng</li>
                <li>📞 Call for bookings</li>
                <li>💳 Card & Cash payments accepted</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Innovating Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

