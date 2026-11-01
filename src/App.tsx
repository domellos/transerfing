import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import { PAGES, ROUTES } from './routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {ROUTES.map(({ path, page: { Component } }) =>
          path === '/' ? (
            <Route key={path} index element={<Component />} />
          ) : (
            <Route key={path} path={path.slice(1)} element={<Component />} />
          ),
        )}
        <Route path="*" element={<PAGES.NotFound.Component />} />
      </Route>
    </Routes>
  );
}
