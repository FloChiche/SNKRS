import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import RegisterPage from './components/RegisterPage';

const API_URL = 'http://localhost:1337/api';
const WishlistContext = React.createContext();

const LoadingPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Ajusté à 2.5 secondes

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${!isLoading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-32 h-32">
        <div className="w-full h-full border-8 border-gray-200 rounded-full animate-spin border-t-gray-800"></div>
      </div>
      <div className="mt-8 text-2xl text-gray-800 font-bold">
        SNKRSs
      </div>
    </div>
  );
};

const SearchAndFilters = ({ onSearch, onBrandFilter, onSort, products }) => {
  const uniqueBrands = [...new Set(products.map(product => product.Brand))];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-full md:max-w-md">
          <input
            type="text"
            placeholder="Rechercher une sneaker..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className="flex flex-row gap-4 w-full md:w-auto">
          <select
            onChange={(e) => onBrandFilter(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les marques</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            onChange={(e) => onSort(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Trier par prix</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist } = React.useContext(WishlistContext);
  const [isZoomed, setIsZoomed] = useState(false);
  if (!product) return null;
  
  const isInWishlist = wishlist.some(item => item.id === product.id);
  const imageUrl = product.Image?.url;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div 
        className="aspect-w-16 aspect-h-9 relative overflow-hidden"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {imageUrl ? (
          <img
            src={`http://localhost:1337${imageUrl}`}
            alt={product.Name}
            className={`w-full h-48 object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-110' : 'scale-100'
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold">{product.Name}</h2>
          <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
            {product.Brand}
          </span>
        </div>
        <p className="text-gray-600 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{(product.Price / 1000).toLocaleString('fr-FR')} €</span>
          <button 
            onClick={() => toggleWishlist(product)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              fill={isInWishlist ? "#ef4444" : "none"}
              stroke={isInWishlist ? "#ef4444" : "currentColor"}
              strokeWidth="2"
              className="transition-colors"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Catalogue = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(product => 
        product.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.Brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      result = result.filter(product => product.Brand === selectedBrand);
    }

    if (sortOrder) {
      result.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.Price - b.Price;
        } else {
          return b.Price - a.Price;
        }
      });
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedBrand, sortOrder, products]);

  return (
    <div>
      <SearchAndFilters 
        onSearch={setSearchTerm}
        onBrandFilter={setSelectedBrand}
        onSort={setSortOrder}
        products={products}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Aucun résultat trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const WishlistPage = () => {
  const { wishlist } = React.useContext(WishlistContext);

  if (wishlist.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ma Liste de Souhaits</h2>
        <p className="text-gray-600">Votre liste de souhaits est vide</p>
        <Link to="/" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Ma Liste de Souhaits ({wishlist.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.id === product.id);
      if (isInWishlist) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/Products/?populate=*`);
        // Délai ajusté à 2.5 secondes
        await new Promise(resolve => setTimeout(resolve, 2500));
        setProducts(response.data.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Erreur de chargement des produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4">
          <header className="py-6">
            <h1 className="text-4xl font-bold text-center text-gray-800">SNKRSs</h1>
          </header>

          <nav className="bg-gray-800 text-white p-4 rounded-lg mb-8">
            <ul className="flex justify-center space-x-8">
              <li>
                <Link to="/" className="hover:text-gray-300 transition-colors">
                  Catalogue
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-gray-300 transition-colors flex items-center">
                  Wishlist
                  {wishlist.length > 0 && (
                    <span className="ml-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-300 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Catalogue products={products} />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </div>
    </WishlistContext.Provider>
  );
};

export default App;