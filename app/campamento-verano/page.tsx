import CampamentoVeranoForm from '../components/CampamentoVeranoForm';
import {
  CAMPAMENTO_EDICION,
  CAMPAMENTO_INSTITUCION,
  CAMPAMENTO_TITULO,
} from '../../lib/campamento-verano';
import './campamento.css';

export const metadata = {
  title: `Campamento de Verano ${CAMPAMENTO_EDICION} | ${CAMPAMENTO_TITULO} — ${CAMPAMENTO_INSTITUCION}`,
  description:
    'Inscripción al campamento de verano Startup Kids Camp — Instituto Winston Churchill',
};

export default function CampamentoVeranoPage() {
  return <CampamentoVeranoForm />;
}
