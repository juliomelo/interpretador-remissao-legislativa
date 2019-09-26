# Referência do LexML

```xml
	<xsd:element name="Remissao">
		<xsd:complexType mixed="true">
			<xsd:complexContent>
				<xsd:extension base="inline">
					<xsd:attributeGroup ref="link"/>
				</xsd:extension>
			</xsd:complexContent>
		</xsd:complexType>
	</xsd:element>

	<xsd:element name="RemissaoMultipla">
		<xsd:complexType mixed="true">
			<xsd:complexContent>
				<xsd:extension base="inline">
					<xsd:attribute ref="xml:base" use="required"/>
				</xsd:extension>
			</xsd:complexContent>
		</xsd:complexType>
	</xsd:element>
```
```xml
	<xsd:attributeGroup name="link">
	                      <xsd:attribute ref="xlink:href" use="required"/>
	</xsd:attributeGroup>
```