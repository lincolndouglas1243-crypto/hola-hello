import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight, BookOpen, Check, ChevronDown, Heart, Menu, Search,
  ShoppingBag, Sparkles, Star, Truck, X,
} from "lucide-react";

type Book = {
  id: number; title: string; author: string; category: string;
  price: number; oldPrice?: number; rating: number; reviews: number;
  cover: string; tag?: string; description: string;
};

const books: Book[] = [
  { id: 1, title: "A Biblioteca da Meia-Noite", author: "Matt Haig", category: "Ficção", price: 42.9, oldPrice: 59.9, rating: 4.9, reviews: 284, tag: "Mais vendido", cover: "https://covers.openlibrary.org/b/isbn/9786555652326-L.jpg", description: "Entre a vida e a morte existe uma biblioteca onde cada livro oferece uma chance de experimentar outra versão da sua história." },
  { id: 2, title: "Hábitos Atômicos", author: "James Clear", category: "Desenvolvimento", price: 48.9, rating: 4.8, reviews: 192, cover: "https://covers.openlibrary.org/b/isbn/9788550807560-L.jpg", description: "Uma abordagem prática para criar bons hábitos, abandonar os maus e construir mudanças duradouras." },
  { id: 3, title: "Tudo é Rio", author: "Carla Madeira", category: "Literatura brasileira", price: 39.9, oldPrice: 49.9, rating: 4.8, reviews: 156, tag: "Oferta", cover: "https://covers.openlibrary.org/b/isbn/9786555871781-L.jpg", description: "Um romance intenso sobre amor, perdão e as correntezas imprevisíveis da vida." },
  { id: 4, title: "O Hobbit", author: "J. R. R. Tolkien", category: "Fantasia", price: 44.9, rating: 4.9, reviews: 321, cover: "https://covers.openlibrary.org/b/isbn/9788595084742-L.jpg", description: "Uma aventura inesperada que leva Bilbo Bolseiro para muito além do conforto do Condado." },
  { id: 5, title: "Essencialismo", author: "Greg McKeown", category: "Desenvolvimento", price: 36.9, rating: 4.7, reviews: 98, cover: "https://covers.openlibrary.org/b/isbn/9788543102146-L.jpg", description: "Um convite a fazer menos, porém melhor, escolhendo com intenção o que realmente importa." },
  { id: 6, title: "A Paciente Silenciosa", author: "Alex Michaelides", category: "Suspense", price: 41.9, oldPrice: 54.9, rating: 4.7, reviews: 210, tag: "Oferta", cover: "https://covers.openlibrary.org/b/isbn/9788501116436-L.jpg", description: "Um thriller psicológico sobre uma artista que deixa de falar após um crime chocante." },
  { id: 7, title: "Pequeno Príncipe", author: "Antoine de Saint-Exupéry", category: "Clássicos", price: 24.9, rating: 5.0, reviews: 407, cover: "https://covers.openlibrary.org/b/isbn/9788595081512-L.jpg", description: "Uma fábula delicada sobre amizade, afeto e as coisas essenciais que os olhos não veem." },
  { id: 8, title: "Torto Arado", author: "Itamar Vieira Junior", category: "Literatura brasileira", price: 46.9, rating: 4.9, reviews: 177, cover: "https://covers.openlibrary.org/b/isbn/9786580309313-L.jpg", description: "A história de duas irmãs e de uma comunidade marcada pela terra, memória e resistência." },
];

const categories = ["Todos", "Ficção", "Fantasia", "Suspense", "Desenvolvimento", "Clássicos", "Literatura brasileira"];
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hola Hello — Livros para abrir novos mundos" },
      { name: "description", content: "Descubra histórias, ideias e novos caminhos na Hola Hello, sua próxima livraria favorita." },
    ],
  }),
  component: Storefront,
});

function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("hola-hello-cart-v1") ?? "{}") as Record<number, number>;
    } catch {
      return {};
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem("hola-hello-cart-v1", JSON.stringify(cart));
    } catch {
      setNotice("Não foi possível salvar o carrinho neste navegador.");
    }
  }, [cart]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const result = books.filter((book) => {
      const matchesCategory = category === "Todos" || book.category === category;
      const matchesQuery = !term || (book.title + " " + book.author + " " + book.category).toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesQuery;
    });
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [query, category, sort]);

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartItems = books.filter((book) => cart[book.id]);
  const subtotal = cartItems.reduce((sum, book) => sum + book.price * cart[book.id], 0);

  function addToCart(book: Book) {
    setCart((current) => ({ ...current, [book.id]: (current[book.id] ?? 0) + 1 }));
    setNotice(book.title + " foi adicionado ao carrinho.");
  }

  function changeQuantity(id: number, amount: number) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] ?? 0) + amount;
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubscribed(true);
    setEmail("");
  }

  function scrollToCatalog() {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  }

  return (
    <div className="store-shell">
      <div className="announcement"><Truck size={14} /> <span>Frete grátis em compras acima de R$ 149</span><span className="announcement-dot">•</span><span>Leitura que chega até você</span></div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Hola Hello, início"><span className="brand-mark"><BookOpen size={22} strokeWidth={1.8} /></span><span>hola<span className="brand-accent">hello</span><small>LIVRARIA</small></span></a>
        <nav className={mobileMenu ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal">
          <a href="#catalogo" onClick={() => setMobileMenu(false)}>Livros</a>
          <a href="#categorias" onClick={() => setMobileMenu(false)}>Categorias</a>
          <a href="#sobre" onClick={() => setMobileMenu(false)}>Nossa história</a>
        </nav>
        <div className="header-actions">
          <label className="header-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar um livro..." aria-label="Buscar livros" /></label>
          <button className="icon-button cart-trigger" onClick={() => setCartOpen(true)} aria-label={"Abrir carrinho, " + cartCount + " itens"}><ShoppingBag size={20} />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
          <button className="icon-button menu-trigger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> UM UNIVERSO DE HISTÓRIAS</span>
            <h1>Há um mundo<br />inteiro <em>entre páginas.</em></h1>
            <p>Encontre sua próxima leitura, descubra novas ideias e deixe cada capítulo levar você mais longe.</p>
            <button className="button button-dark" onClick={scrollToCatalog}>Explorar livros <ArrowRight size={17} /></button>
            <div className="hero-note"><span className="note-line" /> Escolhas que inspiram. Histórias que ficam.</div>
          </div>
          <div className="hero-art" aria-label="Ilustração editorial de livros">
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-book hero-book-back"><div className="book-cover-cover"><span>O TEMPO<br />DAS COISAS</span><small>UMA HISTÓRIA SOBRE RECOMEÇOS</small></div></div>
            <div className="hero-book hero-book-front"><div className="book-cover-cover cover-front"><span>O JARDIM<br />SECRETO</span><small>ONDE FLORESCEM NOVOS MUNDOS</small><i>✳</i></div></div>
            <div className="hero-sticker"><span>+</span><small>UMA BOA<br />HISTÓRIA<br />MUDA TUDO</small></div>
            <div className="hero-caption">SUA PRÓXIMA AVENTURA COMEÇA AQUI</div>
          </div>
          <div className="hero-bottom"><span>01 — 03</span><span className="hero-bottom-line" /><span>DESCUBRA • IMAGINE • VIVA</span></div>
        </section>

        <section className="benefits" aria-label="Vantagens da Hola Hello">
          <div><span className="benefit-icon"><Truck size={19} /></span><span><strong>Entrega para todo o Brasil</strong><small>Seu próximo livro vai até você</small></span></div>
          <div><span className="benefit-icon"><Heart size={19} /></span><span><strong>Feito para leitores</strong><small>Uma curadoria com carinho</small></span></div>
          <div><span className="benefit-icon"><BookOpen size={19} /></span><span><strong>Novas descobertas</strong><small>Histórias para todos os momentos</small></span></div>
        </section>

        <section className="category-section section-wrap" id="categorias">
          <div className="section-heading"><div><span className="eyebrow">ENCONTRE SEU CAMINHO</span><h2>O que você quer <em>ler hoje?</em></h2></div><span className="section-aside">Cada gênero, uma nova jornada.</span></div>
          <div className="category-list">
            {categories.slice(1).map((item, index) => <button key={item} className={"category-chip category-chip-" + index + (category === item ? " selected" : "")} onClick={() => { setCategory(item); scrollToCatalog(); }}><span>{["✳", "◈", "⌕", "✦", "❝", "✺"][index]}</span>{item}<ArrowRight size={14} /></button>)}
          </div>
        </section>

        <section className="catalog-section section-wrap" id="catalogo">
          <div className="section-heading catalog-heading"><div><span className="eyebrow">CURADORIA HOLA HELLO</span><h2>Livros para <em>se perder.</em></h2><p>Boas histórias sempre encontram um jeito de chegar até você.</p></div><a href="#newsletter" className="text-link">Receba novidades <ArrowRight size={15} /></a></div>
          <div className="catalog-toolbar">
            <div className="filter-pills">{categories.map((item) => <button key={item} className={category === item ? "filter-pill active" : "filter-pill"} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <label className="sort-select"><span>Ordenar:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destaques</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="rating">Melhor avaliados</option></select><ChevronDown size={14} /></label>
          </div>
          {filtered.length ? <div className="book-grid">{filtered.map((book) => <article className="book-card" key={book.id}>
            <div className="book-image-wrap">{book.tag && <span className="book-tag">{book.tag}</span>}<button className="favorite-button" aria-label={"Favoritar " + book.title} onClick={() => setNotice("Entre na sua conta para salvar favoritos.")}><Heart size={17} /></button><img src={book.cover} alt={"Capa do livro " + book.title} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /><div className="cover-fallback"><BookOpen size={28} /><span>{book.title}</span></div></div>
            <div className="book-info"><div className="book-rating"><Star size={13} fill="currentColor" /> {book.rating.toFixed(1)} <span>({book.reviews})</span></div><h3>{book.title}</h3><p className="book-author">{book.author}</p><div className="book-price">{book.oldPrice && <del>{money(book.oldPrice)}</del>}<strong>{money(book.price)}</strong></div><button className="add-button" onClick={() => addToCart(book)}>Adicionar ao carrinho <ShoppingBag size={15} /></button></div>
          </article>)}</div> : <div className="empty-results"><Search size={28} /><h3>Nenhum livro encontrado</h3><p>Tente outro título, autor ou categoria.</p><button className="button button-outline" onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar filtros</button></div>}
          <p className="catalog-disclaimer">Seleção ilustrativa para apresentação da loja. Preços, disponibilidade e dados comerciais precisam ser confirmados antes da abertura das vendas.</p>
        </section>

        <section className="editorial-banner">
          <div className="editorial-symbol">“</div><div><span className="eyebrow">UM CONVITE À DESCOBERTA</span><h2>Às vezes, tudo o que falta<br />é <em>virar a primeira página.</em></h2><p>Seu próximo livro favorito pode estar mais perto do que imagina.</p><button className="button button-light" onClick={scrollToCatalog}>Encontrar minha leitura <ArrowRight size={17} /></button></div><div className="editorial-side-note">LEIA SEM PRESSA.<br />SONHE SEM LIMITES.</div>
        </section>

        <section className="about-section section-wrap" id="sobre"><div className="about-art"><div className="about-circle"><BookOpen size={62} strokeWidth={1} /><span>HH</span></div><span className="about-vertical">HISTÓRIAS CONECTAM PESSOAS</span></div><div className="about-copy"><span className="eyebrow">MAIS DO QUE UMA LIVRARIA</span><h2>Um lugar para<br /><em>encontrar histórias.</em></h2><p>A Hola Hello nasceu da ideia de que cada livro abre uma porta. Queremos aproximar leitores de histórias, conhecimentos e perspectivas que fazem a vida ganhar novas cores.</p><p>Prepare o café, escolha seu próximo capítulo e fique à vontade. A casa é sua.</p><a href="#catalogo" className="text-link">Conheça nossa seleção <ArrowRight size={15} /></a></div></section>

        <section className="newsletter-section" id="newsletter"><div><span className="eyebrow">CARTAS PARA QUEM AMA LER</span><h2>Boas histórias<br /><em>merecem ser compartilhadas.</em></h2><p>Receba novidades, lançamentos e inspirações literárias.</p></div><form className="newsletter-form" onSubmit={subscribe}><label htmlFor="newsletter-email">Seu melhor e-mail</label><div className="newsletter-input"><input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /><button type="submit" aria-label="Inscrever-se na newsletter"><ArrowRight size={19} /></button></div><small>{subscribed ? "Inscrição registrada apenas nesta demonstração." : "Sem spam. Apenas boas leituras na sua caixa de entrada."}</small></form></section>
      </main>

      <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><a className="brand brand-light" href="#"><span className="brand-mark"><BookOpen size={22} /></span><span>hola<span className="brand-accent">hello</span><small>LIVRARIA</small></span></a><p>Histórias que aproximam.<br />Ideias que transformam.</p></div><div className="footer-col"><strong>Explore</strong><a href="#catalogo">Todos os livros</a><a href="#categorias">Categorias</a><a href="#newsletter">Novidades</a></div><div className="footer-col"><strong>Atendimento</strong><a href="mailto:oi@holahello.com.br">Fale conosco</a><a href="#sobre">Sobre a Hola Hello</a><span>Seg. a sex. · 9h às 18h</span></div><div className="footer-col"><strong>Informações</strong><span>Política de privacidade</span><span>Trocas e devoluções</span><span>Termos de uso</span></div></div><div className="footer-bottom"><span>© 2026 Hola Hello Livraria. Todos os direitos reservados.</span><span>FEITO PARA QUEM AMA VIRAR PÁGINAS <BookOpen size={13} /></span></div></footer>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={15} /></button></div>}
      {cartOpen && <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Carrinho de compras"><div className="drawer-heading"><div><span className="eyebrow">SUA SELEÇÃO</span><h2>Meu carrinho <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><X /></button></div>{cartItems.length ? <><div className="cart-lines">{cartItems.map((book) => <div className="cart-line" key={book.id}><img src={book.cover} alt="" /><div className="cart-line-info"><strong>{book.title}</strong><small>{book.author}</small><b>{money(book.price)}</b><div className="quantity-control"><button onClick={() => changeQuantity(book.id, -1)} aria-label="Diminuir quantidade">−</button><span>{cart[book.id]}</span><button onClick={() => changeQuantity(book.id, 1)} aria-label="Aumentar quantidade">+</button></div></div><button className="remove-item" onClick={() => changeQuantity(book.id, -cart[book.id])} aria-label={"Remover " + book.title}><X size={16} /></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><small>Frete e condições serão calculados em uma etapa de checkout integrada.</small><button className="button button-dark checkout-button" onClick={() => setNotice("Checkout ainda não está disponível: falta conectar pedidos, estoque e gateway de pagamento.")}>Continuar para compra <ArrowRight size={17} /></button><button className="continue-link" onClick={() => setCartOpen(false)}>Continuar explorando</button></div></> : <div className="cart-empty"><ShoppingBag size={38} /><h3>Seu carrinho está esperando</h3><p>Adicione um livro e comece sua próxima aventura.</p><button className="button button-dark" onClick={() => { setCartOpen(false); scrollToCatalog(); }}>Explorar livros</button></div>}</aside></div>}
    </div>
  );
}
