import { useAuth } from '../context/AuthContext.jsx';

export default function Toast() {
  const { toast } = useAuth();
  return (
    <div className={'toast' + (toast ? ' show' : '') + (toast?.err ? ' err' : '')} role="status">
      <span>{toast?.msg || ''}</span>
    </div>
  );
}
