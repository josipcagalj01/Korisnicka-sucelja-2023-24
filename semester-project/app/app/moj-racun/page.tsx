import type { Metadata } from 'next'
import AccountSettingsWrapper from '../components/wrappers';
import SettingsMenu from '../components/SettingsMenu';
import EmployeeActions from '../components/employeeActions';
import './settingsMenuStyle.css'
import { accountSettings, myActivities } from './[action]/page';

export const metadata: Metadata = {
	title: 'Moja stranica',
	description: 'Izbornici postavki i radnji',
}

async function ManageMyAccount() {
	return (
    <main className='accountPageMain'>
			<AccountSettingsWrapper>
        <EmployeeActions/>
        <SettingsMenu menu={myActivities}/>
        <SettingsMenu menu={accountSettings}/>
      </AccountSettingsWrapper>
    </main>
  )
}
export default ManageMyAccount;