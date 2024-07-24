import type { Metadata } from 'next'
import AccountSettingsWrapper from '../components/accountSettingsWrapper';
import AccountSettingsMenu from '../components/accountSettingsMenu';
import EmployeeActions from '../components/employeeActions';
import './accountSettingsMenuStyle.css'

export const metadata: Metadata = {
	title: 'Moja stranica',
	description: 'Strania s osnovnim korisničkim akcijama',
}

async function ManageMyAccount() {
	return (
    <main className='accountPageMain'>
			<AccountSettingsWrapper>
        <EmployeeActions/>
        <AccountSettingsMenu/>
      </AccountSettingsWrapper>
    </main>
  )
}
export default ManageMyAccount;