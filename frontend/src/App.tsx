import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

const App = () => (
  <>
    <AppRouter />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: { borderRadius: '10px', fontSize: '14px' },
      }}
    />
  </>
);

export default App;