import { AccountLayout } from '../layout/AccountLayout'
import { DashboardCliente } from '../components/account/DashboardCliente'

export function ResumenCuentaPage() {
  return (
    <AccountLayout>
      <DashboardCliente />
    </AccountLayout>
  )
}