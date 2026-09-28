import { ExpandableCheckboxGroupDemo } from "./_expandableCheckboxGroupDemo";
import LanguageSelect from "@/components/languageSelect";
import {
  Hero,
  Article,
  Heading,
  PreHeading,
  Paragraph,
  Separator,
  Alert,
  Card,
  Drawer,
  AccordionProvider,
  Icon,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  FormField,
  FormFieldTextInput,
  FileInput,
  ActionGroup,
  Button,
  LinkButton,
  LinkList,
  LinkListLink,
  LinkListCard,
  Listbox,
  ListboxOption,
  FormFieldCheckboxGroup,
  FormFieldCheckboxOption,
  FormFieldRadioGroup,
  FormFieldRadio,
  DataBadgeButton,
  DotBadge,
  MessageList,
  MessageListItem,
  NavigationList,
  NavigationListItem,
  NumberBadge,
  UnorderedList,
  UnorderedListItem,
  OrderedList,
  OrderedListItem,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
  TextInput,
  Textarea,
  Toggletip,
} from "@rijkshuisstijl-community/components-react";
import PageNumberNavigation from "@/components/pageNumberNavigation";

const TemplatePage = async () => {
  return (
    <>
      <Heading level={1}>MijnOverheid pagina template</Heading>

      <LanguageSelect
        selectedLanguage="Nederlands"
        languages={[
          { lang: "nl", languageName: "Nederlands", href: "#" },
          {
            lang: "en",
            languageName: "English",
            localLanguageName: "Engels",
            href: "#",
          },
          {
            lang: "de",
            languageName: "Deutsch",
            localLanguageName: "Duits",
            href: "#",
          },
        ]}
      />

      <Hero
        heading="Hero afbeelding"
        imageAlt="Hero afbeelding"
        imageSrc="/bg-full-zakelijk.webp"
        subHeading="Subtekst"
      />

      <Alert type="warning">
        <Heading level={3}>Let op!</Heading>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur ad isicing elit, sed do
          eiusmod
        </Paragraph>
      </Alert>

      <Article>
        <PreHeading heading={<Heading level={1}>Koptekst niveau 3</Heading>}>
          PreHeading
        </PreHeading>
        <Paragraph>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tenetur
          fugiat impedit ea, aperiam culpa esse blanditiis laborum cumque, illo
          aut quo, sequi similique ut! Unde expedita adipisci totam. Tenetur,
          aliquam.
        </Paragraph>

        <Separator />

        <Heading level={3}>Koptekst niveau 3</Heading>
        <Heading level={4}>Koptekst niveau 4</Heading>
        <Paragraph>
          Aut temporibus velit, iusto atque pariatur facilis deleniti eum
          obcaecati beatae officiis id magni tempore omnis iure. Eum placeat
          modi in esse aliquam temporibus vel molestias! Fuga maxime accusamus
          ratione. Soluta aperiam sunt voluptates dolores harum officia deserunt
          aliquam consequuntur quasi consectetur et error odit cupiditate omnis
          reiciendis, voluptatem mollitia in distinctio? Quisquam cum accusamus
          fuga odio provident eos repellendus. Dolor animi mollitia a eligendi
          odit ipsum minus ducimus harum sunt voluptate, provident temporibus
          praesentium dolores. Inventore iste ex est consectetur? Enim similique
          ea fuga laudantium aspernatur porro consequuntur nobis. Maxime itaque
          ullam fugiat deleniti dolor reiciendis consequatur vitae,
          reprehenderit tenetur sint iusto ut debitis quo adipisci. Numquam
          praesentium, doloribus omnis ab corrupti ipsum voluptatum labore
          aliquam harum cupiditate debitis!
        </Paragraph>
        <Heading level={5}>Koptekst niveau 5</Heading>
        <Paragraph>
          In quisquam distinctio itaque aperiam similique reprehenderit
          voluptatum error fuga beatae, dignissimos suscipit. Magnam inventore
          eaque nemo voluptate tempore qui iusto? Esse!
        </Paragraph>
      </Article>

      <Card
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        heading="Card koptekst"
        href="#"
        linkLabel="Link label"
        metadata="Metadata"
        subheading="Card subkop"
        title="Card titel"
      />

      <div className="rhc-card-as-link">
        <span className="rhc-card-as-link__anchor">
          <a aria-label="aria-label" href="href" />
        </span>
        <div className="rhc-card-as-link__content">
          <Heading level={3}>Card as link</Heading>
          <Paragraph>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Perspiciatis blanditiis aspernatur porro quae deserunt natus ex modi
            reprehenderit, reiciendis voluptas odio non, neque amet, illum quis
            tenetur eos aperiam possimus.
          </Paragraph>
        </div>
      </div>

      <Drawer align="inline-end" open>
        <Heading level={1}>Drawer</Heading>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Paragraph>
      </Drawer>

      <AccordionProvider
        sections={[
          {
            body: "Accordioninhoud 1",
            label: "Accordionkop 1",
          },
          {
            body: "Accordioninhoud 2",
            label: "Accordionkop 2",
          },
          {
            body: "Accordioninhoud 3",
            label: "Accordionkop 3",
          },
        ]}
      />

      <Fieldset legend="Fieldset legend">
        <FormFieldTextInput label="Field A" />
        <FormFieldTextInput label="Field B" />
        <FormFieldTextInput label="Field C" />
      </Fieldset>

      <FormField
        description="Beschrijving van het onderwerp"
        descriptionId="description"
        errorMessageId="error"
        input={
          <FormFieldCheckboxGroup>
            <FormFieldCheckboxOption label="Checkbox 1" />
            <FormFieldCheckboxOption label="Checkbox 2" />
            <FormFieldCheckboxOption label="Checkbox 3" />
          </FormFieldCheckboxGroup>
        }
        label="Onderwerp"
        status=""
        statusId="status"
      />

      <FormFieldRadioGroup>
        <FormFieldRadio name="radio-group-name" label="Radio 1" />
        <FormFieldRadio name="radio-group-name" label="Radio 2" />
        <FormFieldRadio name="radio-group-name" label="Radio 3" />
      </FormFieldRadioGroup>

      <ExpandableCheckboxGroupDemo />

      <FileInput
        allowedFileTypes=".doc,.docx,.xlsx,.pdf,.zip,.jpg,.png,.bmp,.gif"
        buttonText="Bestanden kiezen"
        fileSizeErrorMessage="Dit bestand is groter dan 10 MB."
        fileTypeErrorMessage="Dit bestandstype wordt niet toegestaan."
        maxFileSizeInBytes={10485760}
      />

      <DataBadgeButton>Data-badge</DataBadgeButton>

      <DotBadge label="Nieuwe Bericht" />

      <DataSummary appearance="column">
        <DataSummaryItem itemKey="itemKey" itemValue="itemValue" />
        <DataSummaryItem href="#" itemKey="itemKey" itemValue="itemValue">
          Lorem ipsum dolor
          <Icon icon="externe-link" />
        </DataSummaryItem>
      </DataSummary>

      <ActionGroup direction="row">
        <Button appearance="secondary-action-button">Bewaar</Button>
        <Button appearance="secondary-action-button">Deel</Button>
        <Button appearance="secondary-action-button">
          Niet relevant voor mij
        </Button>
        <Button appearance="secondary-action-button">
          Vraag aan de digitale assistent
        </Button>
      </ActionGroup>

      <Button appearance="primary-action-button">Button</Button>

      <LinkButton>LinkButton</LinkButton>

      <LinkList>
        <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
          LinkList
        </LinkListLink>
        <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
          Link 2
        </LinkListLink>
        <LinkListLink href="#" icon={<Icon icon="chevron-right" />}>
          Link 3
        </LinkListLink>
      </LinkList>

      <LinkListCard heading="LinkListCard" headingLevel={2}>
        <LinkListLink href="#">Link 1</LinkListLink>
        <LinkListLink href="#">Link 2</LinkListLink>
        <LinkListLink href="#">Link 3</LinkListLink>
      </LinkListCard>

      <Listbox aria-label="Listbox">
        <ListboxOption>Option #1</ListboxOption>
        <ListboxOption>Option #2</ListboxOption>
        <ListboxOption>Option #3</ListboxOption>
      </Listbox>

      <MessageList>
        <MessageListItem
          description="Uw pensioenoverzicht"
          href="#"
          label="Pensioenfonds"
          metaData="01-05-2024"
          withBadge={{
            label: "Nieuw",
            role: "status",
          }}
        />
        <MessageListItem
          description="Herinnering APK"
          href="#"
          label="RDW"
          metaData="04-04-2024"
        />
        <MessageListItem
          description="Aanslag OZB"
          href="#"
          label="Samenwerkings-verband Haaglanden"
          metaData="04-04-2024"
        />
      </MessageList>

      <NavigationList>
        <NavigationListItem
          description="Uw gegevens, familie en identiteitsbewijs"
          href="#"
          icon="user"
          label="Identiteit"
        />
        <NavigationListItem
          description="Uw inkomen, toeslagen, bijdragen en belastingen"
          href="#"
          icon="currency-euro"
          label="Financiën"
        />
      </NavigationList>

      <NumberBadge>33</NumberBadge>

      <UnorderedList>
        <UnorderedListItem>List item 1</UnorderedListItem>
        <UnorderedListItem>List item 2</UnorderedListItem>
        <UnorderedListItem>List item 3</UnorderedListItem>
      </UnorderedList>

      <OrderedList>
        <OrderedListItem>Ordered List item 1</OrderedListItem>
        <OrderedListItem>Ordered List item 2</OrderedListItem>
        <OrderedListItem>Ordered List item 3</OrderedListItem>
      </OrderedList>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell scope="col">Tabelkop</TableHeaderCell>
            <TableHeaderCell scope="col">Tabelkop</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Tabel-cel</TableCell>
            <TableCell>Tabel-cel</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <TextInput aria-label="text-input-label" name="subject" />

      <Textarea aria-label="textarea-label" name="subject" />

      <Toggletip>Toggletip</Toggletip>

      <PageNumberNavigation maxVisiblePages={5} page={1} totalPages={10} />
    </>
  );
};

export default TemplatePage;
