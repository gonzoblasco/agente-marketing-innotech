import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 InnoTech Solutions
          </h1>
          <p className="text-xl text-gray-600">
            Agente: Consultor de Marketing Digital para PyMEs
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  );
}